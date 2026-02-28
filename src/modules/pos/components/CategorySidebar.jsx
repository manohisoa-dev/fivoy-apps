export default function CategorySidebar({ categories, selected, onSelect }) {
  return (
    <div className="w-44 bg-white border-r overflow-y-auto p-2 space-y-1">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`w-full text-left px-2 py-1 rounded text-sm font-medium transition
            ${selected === cat.id
              ? "bg-indigo-600 text-white"
              : "hover:bg-gray-100"}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}