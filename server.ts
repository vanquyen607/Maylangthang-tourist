import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GoogleGenAI,
  Type,
  type Content,
  type FunctionDeclaration,
  type Part,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';
const VALID_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface CatalogTourSummary {
  id: string;
  title: string;
  destination: string;
  zone: string;
  category: string;
  duration: string;
  price: number;
  groupSize: string;
  departureInfo: string;
  highlights: string[];
  packages: { id: string; label: string; summary: string; priceDelta: number }[];
}

interface CatalogDestinationSummary {
  id: string;
  name: string;
  region: string;
  zone: string;
  bestSeason: string;
  tagline: string;
}

interface CatalogExperienceSummary {
  id: string;
  title: string;
  location: string;
  duration: string;
}

interface CatalogPayload {
  tours?: CatalogTourSummary[];
  destinations?: CatalogDestinationSummary[];
  experiences?: CatalogExperienceSummary[];
  contact?: {
    hotline?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    address?: string;
    hanoiOffice?: string;
  };
}

interface BookingSubmissionPayload {
  fullName: string;
  phone: string;
  tourId: string;
  tourTitle: string;
  packageId: string;
  packageLabel: string;
  note: string;
}

const recommendToursDeclaration: FunctionDeclaration = {
  name: 'recommend_tours',
  description:
    'Display interactive tour recommendation cards in the chat UI for 1 to 3 tours from the Mây Lang Thang catalog that match the traveler’s preferences.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      tourIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          'Exact tour IDs from the provided catalog (1 to 3 IDs).',
      },
      reason: {
        type: Type.STRING,
        description: 'Brief internal summary of why these tours match.',
      },
    },
    required: ['tourIds'],
  },
};

const submitBookingInquiryDeclaration: FunctionDeclaration = {
  name: 'submit_booking_inquiry',
  description:
    'Create and save a booking reservation inquiry when the traveler has explicitly provided their full name, a valid Vietnamese phone number (e.g. 0912345678 or +84912345678), chosen a tour (or custom-private), and confirmed they want to reserve/book.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fullName: {
        type: Type.STRING,
        description: 'Traveler full name (at least 2 characters).',
      },
      phone: {
        type: Type.STRING,
        description:
          'Traveler Vietnamese phone number (digits starting with 0 or +84, 9-11 digits).',
      },
      tourId: {
        type: Type.STRING,
        description:
          'Exact tour ID from the catalog, or "custom-private" for a tailored itinerary.',
      },
      packageId: {
        type: Type.STRING,
        description:
          'Stay tier package ID: "local-standard", "boutique-retreat", or "private-group". Defaults to "local-standard" if unspecified.',
      },
      note: {
        type: Type.STRING,
        description:
          'Optional details such as preferred travel dates, guest count, dietary notes, or requested add-ons.',
      },
    },
    required: ['fullName', 'phone', 'tourId'],
  },
};

function buildSystemInstruction(lang: 'vi' | 'en', catalog: CatalogPayload): string {
  const tours = Array.isArray(catalog.tours) ? catalog.tours.slice(0, 40) : [];
  const destinations = Array.isArray(catalog.destinations)
    ? catalog.destinations.slice(0, 40)
    : [];
  const experiences = Array.isArray(catalog.experiences)
    ? catalog.experiences.slice(0, 30)
    : [];
  const contact = catalog.contact || {};

  const tourLines = tours
    .map((t) => {
      const pkgText = (t.packages || [])
        .map((p) => `${p.id} (${p.label}: +${p.priceDelta.toLocaleString('en-US')}₫)`)
        .join(', ');
      return `- [${t.id}] "${t.title}" | ${t.destination} (${t.zone}) | ${t.category} | ${t.duration} | Giá gốc: ${t.price.toLocaleString('en-US')}₫ | ${t.groupSize} | ${t.departureInfo} | Gói: ${pkgText}`;
    })
    .join('\n');

  const destLines = destinations
    .map(
      (d) =>
        `- ${d.name} (${d.region}, ${d.zone}) · Mùa đẹp: ${d.bestSeason} · ${d.tagline}`
    )
    .join('\n');

  const expLines = experiences
    .map((e) => `- ${e.title} (${e.location} · ${e.duration})`)
    .join('\n');

  return `Bạn là Chuyên viên Tư vấn Hành trình của "Mây Lang Thang" (khẩu hiệu: "Đi chậm, sống nhiều.").
Phong cách giao tiếp: Ấm áp, chân thành, điềm tĩnh, tinh tế, thực tế và không dùng ngôn từ quảng cáo phô trương.
Ngôn ngữ giao diện hiện tại: ${lang === 'en' ? 'English (trả lời bằng tiếng Anh trừ khi khách chủ động nhắn tiếng Việt)' : 'Tiếng Việt (trả lời tiếng Việt tự nhiên, xưng "mình" hoặc "Mây Lang Thang", gọi khách là "bạn")'}.

NGUYÊN TẮC BẮT BUỘC:
1. Chỉ tư vấn các tour, điểm đến, trải nghiệm và mức giá CÓ THẬT trong danh mục bên dưới. Tuyệt đối không bịa thêm tour, giá hoặc lịch trình ngoài danh mục. Nếu khách muốn đi tuyến chưa có sẵn, đề xuất mã "custom-private" (Thiết kế lịch trình riêng cho gia đình / nhóm riêng).
2. Hỏi ngắn gọn để hiểu nhu cầu (số ngày, đi biển/núi/văn hóa/ẩm thực, số khách, tháng dự kiến) rồi đề xuất 1–3 tour phù hợp nhất.
3. Mỗi khi giới thiệu 1–3 tour cụ thể từ danh mục, BẮT BUỘC gọi tool \`recommend_tours\` với đúng danh sách \`tourIds\` để hệ thống hiển thị thẻ tour trực quan cho khách.
4. Khi khách muốn chốt tour / giữ chỗ ("đặt tour", "chốt giúp mình", "giữ chỗ"):
   - Giải thích nhẹ nhàng rằng khách chưa cần thanh toán ngay, chỉ cần để lại **Họ tên** + **Số điện thoại** + **Tour/Gói mong muốn** (và ngày dự kiến/số khách nếu có).
   - CHỈ gọi tool \`submit_booking_inquiry\` khi bạn ĐÃ CÓ đủ: Họ tên rõ ràng (>= 2 ký tự), Số điện thoại Việt Nam hợp lệ (bắt đầu bằng 0 hoặc +84, 10–11 số), và tour cụ thể. Nếu thiếu tên hoặc SĐT chưa hợp lệ, hãy hỏi lại khách trước khi gọi tool.
5. Trả lời súc tích (khoảng 3–6 câu hoặc gạch đầu dòng ngắn gọn, dễ đọc trên khung chat).

THÔNG TIN LIÊN HỆ MÂY LANG THANG:
- Hotline: ${contact.hotline || '1900 6868 24'} · Zalo/ĐT: ${contact.phone || '0912 345 678'} · Email: ${contact.email || 'xin-chao@maylangthang.vn'}
- Giờ làm việc: ${contact.workingHours || '08:00 – 20:00 (Thứ 2 – Chủ nhật)'}
- VP TP.HCM: ${contact.address || '42 Trần Quốc Thảo, Quận 3, TP.HCM'}
- VP Hà Nội: ${contact.hanoiOffice || '18 Hàng Trống, Hoàn Kiếm, Hà Nội'}
- Dịch vụ chọn thêm phổ biến: Đưa đón sân bay/ga tàu (+450,000₫), Nhiếp ảnh gia nửa ngày (+1,200,000₫), Thực đơn chay/dị ứng (+250,000₫).

DANH SÁCH ĐIỂM ĐẾN ĐANG MỞ:
${destLines || '(Chưa có dữ liệu)'}

DANH SÁCH TOUR HIỆN CÓ:
${tourLines || '(Chưa có dữ liệu)'}

TRẢI NGHIỆM BẢN ĐỊA LẺ:
${expLines || '(Chưa có dữ liệu)'}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(500).json({
        error:
          'GEMINI_API_KEY chưa được cấu hình trong Settings > Secrets.',
      });
      return;
    }

    try {
      const body = req.body as {
        messages?: ChatHistoryItem[];
        lang?: 'vi' | 'en';
        catalog?: CatalogPayload;
      };

      const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
      const lang: 'vi' | 'en' = body?.lang === 'en' ? 'en' : 'vi';
      const catalog: CatalogPayload = body?.catalog || {};
      const tours = Array.isArray(catalog.tours) ? catalog.tours : [];

      const sanitized = rawMessages
        .filter(
          (m): m is ChatHistoryItem =>
            Boolean(m) &&
            (m.role === 'user' || m.role === 'model') &&
            typeof m.text === 'string' &&
            m.text.trim().length > 0
        )
        .slice(-16)
        .map((m) => ({
          role: m.role,
          text: m.text.trim().slice(0, 2000),
        }));

      // Ensure conversation starts with a user turn
      const firstUserIdx = sanitized.findIndex((m) => m.role === 'user');
      if (firstUserIdx === -1) {
        res.status(400).json({ error: 'Tin nhắn trống.' });
        return;
      }

      const conversationHistory: Content[] = sanitized
        .slice(firstUserIdx)
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = buildSystemInstruction(lang, catalog);
      const tools = [
        {
          functionDeclarations: [
            recommendToursDeclaration,
            submitBookingInquiryDeclaration,
          ],
        },
      ];

      const validTourMap = new Map(tours.map((t) => [t.id, t]));
      const recommendedTourIds: string[] = [];
      let bookingSubmission: BookingSubmissionPayload | null = null;

      let contents: Content[] = [...conversationHistory];
      let finalText = '';

      for (let step = 0; step < 3; step++) {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction,
            tools,
          },
        });

        const calls = response.functionCalls;
        if (!calls || calls.length === 0) {
          finalText = (response.text || '').trim();
          break;
        }

        const previousContent = response.candidates?.[0]?.content;
        if (!previousContent) {
          finalText = (response.text || '').trim();
          break;
        }

        const functionResponseParts: Part[] = [];

        for (const call of calls) {
          const args = (call.args || {}) as Record<string, unknown>;

          if (call.name === 'recommend_tours') {
            const rawIds = Array.isArray(args.tourIds) ? args.tourIds : [];
            const matched = rawIds
              .map((id) => String(id).trim())
              .filter((id) => validTourMap.has(id))
              .slice(0, 3);

            matched.forEach((id) => {
              if (!recommendedTourIds.includes(id)) {
                recommendedTourIds.push(id);
              }
            });

            functionResponseParts.push({
              functionResponse: {
                id: call.id,
                name: 'recommend_tours',
                response: {
                  ok: true,
                  displayedTourIds: matched,
                },
              },
            });
          } else if (call.name === 'submit_booking_inquiry') {
            const fullName = String(args.fullName || '').trim().slice(0, 120);
            const cleanedPhone = String(args.phone || '')
              .replace(/[\s.-]/g, '')
              .slice(0, 20);
            const rawTourId = String(args.tourId || 'custom-private').trim();
            const matchedTour = validTourMap.get(rawTourId);
            const tourId = matchedTour ? matchedTour.id : 'custom-private';
            const tourTitle = matchedTour
              ? matchedTour.title
              : lang === 'en'
                ? 'Tailored Private Itinerary'
                : 'Thiết kế lịch trình riêng';

            const requestedPkgId = String(args.packageId || 'local-standard').trim();
            const matchedPkg = matchedTour?.packages?.find(
              (p) => p.id === requestedPkgId
            ) || matchedTour?.packages?.[0];

            const packageId = matchedPkg?.id || requestedPkgId || 'local-standard';
            const packageLabel =
              matchedPkg?.label ||
              (packageId === 'boutique-retreat'
                ? 'Gói Boutique'
                : packageId === 'private-group'
                  ? 'Nhóm riêng tư'
                  : 'Gói Bản Địa');
            const note = String(args.note || '').trim().slice(0, 1000);

            if (fullName.length < 2) {
              functionResponseParts.push({
                functionResponse: {
                  id: call.id,
                  name: 'submit_booking_inquiry',
                  response: {
                    ok: false,
                    error: 'Missing traveler full name (minimum 2 characters). Ask the user for their full name.',
                  },
                },
              });
            } else if (!VALID_PHONE_REGEX.test(cleanedPhone)) {
              functionResponseParts.push({
                functionResponse: {
                  id: call.id,
                  name: 'submit_booking_inquiry',
                  response: {
                    ok: false,
                    error:
                      'Invalid Vietnamese phone number format. Must start with 0 or +84 followed by 8 to 10 digits. Ask the user to provide a valid phone number.',
                  },
                },
              });
            } else {
              bookingSubmission = {
                fullName,
                phone: cleanedPhone,
                tourId,
                tourTitle,
                packageId,
                packageLabel,
                note,
              };

              functionResponseParts.push({
                functionResponse: {
                  id: call.id,
                  name: 'submit_booking_inquiry',
                  response: {
                    ok: true,
                    readyToPersist: true,
                    fullName,
                    phone: cleanedPhone,
                    tourTitle,
                    packageLabel,
                  },
                },
              });
            }
          }
        }

        if (functionResponseParts.length === 0) {
          finalText = (response.text || '').trim();
          break;
        }

        contents = [
          ...contents,
          previousContent,
          {
            role: 'user',
            parts: functionResponseParts,
          },
        ];
      }

      if (!finalText) {
        finalText =
          lang === 'en'
            ? 'I have prepared those details for you below.'
            : 'Mình đã cập nhật thông tin bên dưới để bạn xem nhé.';
      }

      res.json({
        reply: finalText,
        recommendedTourIds,
        bookingSubmission,
      });
    } catch (error) {
      console.error('Gemini chat error:', error);
      const message =
        error instanceof Error ? error.message : 'Unable to reach Gemini service.';
      const status =
        message.includes('PERMISSION_DENIED') || message.includes('403')
          ? 403
          : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
            ? 429
            : message.includes('API_KEY_INVALID')
              ? 400
              : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
