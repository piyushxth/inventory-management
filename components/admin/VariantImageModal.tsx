import { useEffect, useState } from "react";
import ImageDropzone from "./ImageDropzone";

type VariantImage = {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

type Props = {
  images: VariantImage[];
  onClose: () => void;
  onSave: (images: VariantImage[]) => void;
};

async function uploadImages(files: File[]) {
  const formData = new FormData();
  formData.append("entityType", "products");

  files.forEach((file) => {
    formData.append("gallery", file);
  });

  const res = await fetch("/api/upload-demo", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error("Upload failed");
  }

  return data.files.gallery as string[];
}

export default function VariantImageModal({
  images: initialImages,
  onClose,
  onSave,
}: Props) {
  // console.log("Initial Images:", initialImages);
  const [images, setImages] = useState<VariantImage[]>(initialImages);

  // 🔥 Handle uploaded files
  const handleUpload = async (files: File[]) => {
    try {
      const uploadedUrls = await uploadImages(files);

      const newImages: VariantImage[] = uploadedUrls.map((url, index) => ({
        id: crypto.randomUUID(),
        url, // ✅ REAL FILE PATH
        isPrimary: images.length === 0 && index === 0,
        sortOrder: images.length + index,
      }));
      // console.log("Newly Uploaded Images:", newImages);
      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // ❌ Remove
  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // ⭐ Set primary
  const setPrimary = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      })),
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[80vh] overflow-y-auto rounded-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Variant Images</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* 🔥 Dropzone */}
        <ImageDropzone onUpload={handleUpload} />

        {/* Preview grid */}
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group border rounded">
              <img src={img.url} className="w-full h-24 object-cover rounded" />

              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-xs bg-green-500 text-white px-1 rounded">
                  Primary
                </span>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-1">
                <button
                  onClick={() => setPrimary(img.id)}
                  className="text-xs bg-white px-2 py-1 rounded"
                >
                  Set Primary
                </button>
                <button
                  onClick={() => removeImage(img.id)}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-3 py-1 rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(images)}
            className="bg-black text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
