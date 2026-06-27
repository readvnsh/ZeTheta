import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onChange: (signatureBase64: string | null) => void;
  value: string | null;
  hasError?: boolean;
}

export default function SignaturePad({
  onChange,
  value,
  hasError = false,
}: SignaturePadProps) {
  const sigCanvasRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    onChange(null);
  };

  const handleEnd = () => {
    if (sigCanvasRef.current) {
      if (sigCanvasRef.current.isEmpty()) {
        onChange(null);
      } else {
        const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
        onChange(dataUrl);
      }
    }
  };

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-gray-700">Digital Signature</span>
      <div
        className={`border-2 rounded-xl p-1 bg-white relative transition-all
          ${hasError ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <SignatureCanvas
          ref={sigCanvasRef}
          onEnd={handleEnd}
          canvasProps={{
            className: 'w-full h-44 cursor-crosshair rounded-lg bg-gray-50/50',
          }}
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm z-10"
        >
          Clear
        </button>
      </div>
      {value && (
        <p className="text-xs text-green-600 font-medium">✓ Signature captured successfully</p>
      )}
    </div>
  );
}
