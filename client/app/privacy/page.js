import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
    {
        title: '1. Information We Collect',
        content: [
            'When you create an account, place an order, contact us, or use our services, we may collect information that you provide to us.',
            'This may include your name, email address, phone number, shipping address, order details, and information required to provide customer support.',
            'For manual payments, we may collect your UTR or transaction reference number and payment proof submitted with an order.'
        ]
    },
    {
        title: '2. Account & Authentication',
        content: [
            'Account authentication may be provided through Clerk when authentication is enabled on the website.',
            'Authentication providers may process information according to their own privacy policies and terms. We use authentication information to identify your account and provide account-related services.'
        ]
    },
    {
        title: '3. How We Use Your Information',
        content: [
            'We use collected information to process and deliver orders, communicate with you about your orders, provide customer support, verify payments, maintain your account, improve our services, and protect the security of our website.',
            'We do not use your information for purposes that are unrelated to providing or improving our services unless permitted or required by applicable law.'
        ]
    },
    {
        title: '4. Payment Information',
        content: [
            'Gift Zone may support manual payments through the payment instructions displayed during checkout.',
            'When you submit payment proof, the uploaded screenshot and transaction reference may be reviewed by our authorized administrators to verify your payment and process your order.',
            'We do not ask you to provide your ATM PIN, internet banking password, card PIN, or other confidential banking credentials.'
        ]
    },
    {
        title: '5. Orders & Shipping Information',
        content: [
            'We use the information provided during checkout to process your order and arrange delivery.',
            'Shipping information may be shared with delivery or logistics service providers when necessary to deliver your order.',
            'Order records may include purchased products, quantities, prices, shipping details, payment status, and order status.'
        ]
    },
    {
        title: '6. Cookies & Local Storage',
        content: [
            'Our website may use cookies, local storage, or similar browser technologies to support features such as authentication, shopping cart functionality, preferences, and a smoother shopping experience.',
            'Your browser may allow you to control or remove cookies and locally stored information. Disabling certain storage technologies may affect some website features.'
        ]
    },
    {
        title: '7. Third-Party Services',
        content: [
            'We may use trusted third-party services to operate parts of our website, including authentication, cloud image storage, hosting, analytics, communication, payment verification, or other infrastructure services.',
            'These services may process information according to their own terms and privacy policies. We only use information necessary for the relevant service or business purpose.'
        ]
    },
    {
        title: '8. Data Security',
        content: [
            'We take reasonable technical and organizational measures to protect information handled through our website against unauthorized access, misuse, alteration, or disclosure.',
            'However, no internet transmission or electronic storage system can be guaranteed to be completely secure.'
        ]
    },
    {
        title: '9. Data Retention',
        content: [
            'We retain account, order, payment verification, and support information for as long as reasonably necessary to provide our services, maintain business records, resolve disputes, prevent fraud, and comply with applicable legal requirements.'
        ]
    },
    {
        title: '10. Your Rights',
        content: [
            'Depending on applicable law, you may have rights regarding the personal information we hold about you, including requesting access, correction, or deletion of certain information.',
            'To make a privacy-related request, please contact us using the contact details provided on our website. We may need to verify your request before processing it.'
        ]
    },
    {
        title: '11. Children’s Privacy',
        content: [
            'Our services are not intentionally designed to collect personal information from children without appropriate authorization. If you believe a child has provided personal information to us improperly, please contact us so that we can review the situation.'
        ]
    },
    {
        title: '12. Changes to This Privacy Policy',
        content: [
            'We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices.',
            'When changes are made, the updated version will be published on this page with the revised effective date.'
        ]
    },
    {
        title: '13. Contact Us',
        content: [
            'If you have questions, concerns, or requests regarding this Privacy Policy or the way your information is handled, please contact Gift Zone through the contact information provided on our website.'
        ]
    }
];

export default function Page() {
    return (
        <>
            <Header />

            <main className="bg-slate-50">
                <section className="border-b border-slate-200 bg-white">
                    <div className="section-pad">
                        <div className="container-width max-w-4xl">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                                Gift Zone
                            </p>

                            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                Privacy Policy
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                                This Privacy Policy explains how Gift Zone
                                collects, uses, protects, and handles information
                                when you use our website and services.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                    Effective: September 17, 2026
                                </span>

                                <span className="rounded-full bg-red-50 px-3 py-1.5 text-[#c92532]">
                                    Privacy & Data Protection
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-pad">
                    <div className="container-width max-w-4xl">
                        <div className="grid gap-5">
                            {sections.map((section) => (
                                <section
                                    key={section.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                                >
                                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                                        {section.title}
                                    </h2>

                                    <div className="mt-4 grid gap-3">
                                        {section.content.map((paragraph, index) => (
                                            <p
                                                key={index}
                                                className="text-sm leading-7 text-slate-600 sm:text-[15px]"
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}