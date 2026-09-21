import {
    ExternalLink,
    Image as ImageIcon
} from "lucide-react";

const PaymentProof = ({ order }) => {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ImageIcon
                        size={18}
                        className="text-[#c92532]"
                    />

                    <h3 className="font-extrabold text-slate-900">
                        Payment Proof
                    </h3>
                </div>

                {order.paymentProofUrl && (
                    <a
                        href={order.paymentProofUrl}
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#c92532] hover:underline"
                    >
                        Open
                        <ExternalLink size={13} />
                    </a>
                )}
            </div>

            {order.paymentProofUrl ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg bg-slate-50">
                    <a
                        href={order.paymentProofUrl}
                        rel="noreferrer"
                    >
                        <img
                            src={order.paymentProofUrl}
                            alt="Payment proof"
                            className="md:max-h-80 max-h-50 w-full object-cover"
                        />
                    </a>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                    <ImageIcon
                        size={32}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-500">
                        Payment screenshot not available
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentProof;