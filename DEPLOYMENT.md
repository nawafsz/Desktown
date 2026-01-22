# تعليمات رفع وتشغيل مشروع OneDesk على الاستضافة

هذا الملف يحتوي على الخطوات اللازمة لتشغيل مشروع المكتب السحابي على خادم (Server) أو استضافة تدعم Node.js.

## المتطلبات الأساسية
- **Node.js**: الإصدار 18 أو أحدث.
- **قاعدة بيانات PostgreSQL**: المشروع مجهز للعمل مع Neon.tech أو أي مزود PostgreSQL آخر (مثل Supabase).

## حل مشكلة "Endpoint Disabled" (Render/Neon)
إذا ظهر لك الخطأ `The endpoint has been disabled. Enable it using Neon API and retry`، فهذا يعني أن قاعدة بيانات Neon قد توقفت بسبب عدم النشاط.

**الحل 1: استخدام Supabase (مستقر ومجاني)**
استخدم رابط الاتصال الخاص بـ Supabase بدلاً من Neon في إعدادات Render.
1. اذهب إلى Render Dashboard > Environment.
2. عدل المتغير `DATABASE_URL` إلى:
```
postgresql://postgres:Rayan201667$@db.ngnbwllvwvblvylllvyr.supabase.co:5432/postgres?sslmode=no-verify
```

**الحل 2: إعادة تفعيل Neon**
1. سجل الدخول إلى لوحة تحكم Neon.tech.
2. اذهب إلى المشروع واضغط على زر التفعيل (Wake up/Start).

**الحل 3: استخدام رابط اتصال Neon الجديد (تم التحقق منه)**
إذا قمت بإنشاء قاعدة بيانات جديدة أو نقطة اتصال جديدة، استخدم الرابط التالي في إعدادات Render:
```
postgresql://neondb_owner:npg_paYlKD4R7hSI@ep-super-rain-ahlt4hgi-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## الخطوات العامة للنشر:

### 1. إعداد المتغيرات البيئية (Environment Variables)
يجب إنشاء ملف `.env` في المجلد الرئيسي للمشروع على الاستضافة وإضافة القيم التالية:

```env
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
SESSION_SECRET=اكتب_كلمة_سر_عشوائية_هنا
NODE_ENV=production
PORT=5000

# إذا كنت تستخدم Replit OIDC للمصادقة:
REPLIT_CLIENT_ID=معرف_العميل_الخاص_بك
ISSUER_URL=https://replit.com/oidc
```

### 2. تثبيت الحزم (Dependencies)
قم بتشغيل الأمر التالي لتثبيت المكتبات المطلوبة:
```bash
npm install --production
```

### 3. تحديث قاعدة البيانات (Database Push)
للتأكد من أن جداول قاعدة البيانات مطابقة للكود، قم بتشغيل:
```bash
npx drizzle-kit push
```

### 4. تشغيل المشروع
لتشغيل النسخة النهائية (Production build):
```bash
npm start
```

## ملاحظات هامة:
- المشروع تم ضغطه بدون مجلد `node_modules` لتقليل الحجم، لذا يجب تشغيل `npm install` عند الرفع.
- تأكد من أن المنفذ (Port) المختار (مثلاً 5000) مفتوح في إعدادات جدار الحماية الخاص بالاستضافة.
- تم حصر الدخول فقط للحسابات الإدارية المسجلة في قاعدة البيانات لضمان خصوصية العمل.

---
**تم التجهيز بواسطة Antigravity AI**
