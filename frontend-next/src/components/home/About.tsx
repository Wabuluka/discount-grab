export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered content */}
        <div className="text-center mb-16">
          <p className="text-sm text-slate-400 uppercase tracking-widest mb-4">
            About Us
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 max-w-2xl mx-auto leading-snug">
            Quality products, honest prices, delivered to your door.
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            We connect people with genuine electronics from trusted brands.
            No markup games, just straightforward shopping.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center items-center gap-12 md:gap-20 py-10 border-y border-slate-100">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-semibold text-slate-900">10+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Years</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-semibold text-slate-900">50K+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-semibold text-slate-900">99%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Satisfaction</div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { title: "Authentic", desc: "Verified genuine products" },
            { title: "Fair Prices", desc: "No hidden markups" },
            { title: "Warranty", desc: "Full manufacturer coverage" },
            { title: "Fast Delivery", desc: "Nationwide shipping" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-sm font-medium text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
