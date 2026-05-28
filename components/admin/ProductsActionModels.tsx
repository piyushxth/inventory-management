"use client";

type Product = {
  id: string;
  name: string;
  slug: string;
};

type ModalType = "inventory" | "general" | "custom";

interface ProductActionModalProps {
  product: Product;
  onClose: () => void;
  onSelect: (type: ModalType) => void;
}

export default function ProductActionModal({
  product,
  onClose,
  onSelect,
}: ProductActionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-lg font-semibold mb-6 text-gray-800">
          Products Action — {product.name}
        </h2>

        <div className="space-y-4">
          {/* View Product */}
          <button
            onClick={() => window.open(`/products/${product.slug}`, "_blank")}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="text-xl">👁</span>
            <div className="text-left">
              <p className="font-medium text-gray-800">View Product</p>
              <p className="text-sm text-gray-500">
                Open product page in new tab
              </p>
            </div>
          </button>

          {/* Edit General */}
          <button
            onClick={() => onSelect("general")}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="text-xl">✏️</span>
            <div className="text-left">
              <p className="font-medium text-gray-800">
                Edit General Information
              </p>
              <p className="text-sm text-gray-500">
                Name, slug, description, images, categories
              </p>
            </div>
          </button>

          {/* Price & Inventory */}
          <button
            onClick={() => onSelect("inventory")}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="text-xl">💰</span>
            <div className="text-left">
              <p className="font-medium text-gray-800">
                Edit Price & Inventory
              </p>
              <p className="text-sm text-gray-500">
                Manage pricing, quantity and stock
              </p>
            </div>
          </button>

          {/* Custom Fields */}
          <button
            onClick={() => onSelect("custom")}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="text-xl">⚙️</span>
            <div className="text-left">
              <p className="font-medium text-gray-800">Edit Custom Fields</p>
              <p className="text-sm text-gray-500">
                Manage extra data for product orders
              </p>
            </div>
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
