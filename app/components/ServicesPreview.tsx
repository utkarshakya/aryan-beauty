const previewServices = [
  { name: "Haircut & Styling", price: "₹500" },
  { name: "Facial Treatment", price: "₹800" },
  { name: "Manicure & Pedicure", price: "₹600" },
];

export default function ServicesPreview() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">
          Popular Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewServices.map((s) => (
            <div key={s.name} className="bg-pink-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
              <p className="text-pink-600 mt-2">{s.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
