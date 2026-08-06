export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#4a453f]">
      {/* Header */}
      <header className="bg-[#f7f5f2]/90 backdrop-blur sticky top-0 z-20 border-b border-[#e8e4de]">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-5">
          <a href="/" className="text-xl tracking-[0.25em] font-light text-[#3d3935]">
            Anything
          </a>
          <nav className="flex items-center gap-6 text-xs tracking-widest text-[#7a746c]">
            <a href="#about" className="hover:text-[#3d3935] transition hidden sm:inline">
              ABOUT
            </a>
            <a href="#menu" className="hover:text-[#3d3935] transition hidden sm:inline">
              MENU
            </a>
            <a href="#access" className="hover:text-[#3d3935] transition hidden sm:inline">
              ACCESS
            </a>
            <a
              href="/reserve"
              className="border border-[#c4bdb3] px-4 py-2 rounded-full hover:bg-white transition"
            >
              RESERVE
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <p className="text-[11px] tracking-[0.4em] text-[#a39e96] mb-8">
          PRIVATE BEAUTY SALON
        </p>
        <h1 className="text-3xl md:text-4xl font-light leading-[1.7] text-[#3d3935] mb-10">
          「美しくありたい」
          <br />
          その想いを叶える第一歩をお手伝いします。
        </h1>
        <p className="text-sm md:text-base text-[#7a746c] leading-relaxed max-w-md mx-auto mb-12">
          結果にこだわる施術で、
          <br />
          あなたの美をトータルサポート。
        </p>
        <a
          href="/reserve"
          className="inline-block bg-[#5c564f] text-[#f7f5f2] px-10 py-3.5 rounded-full text-xs tracking-[0.2em] hover:bg-[#3d3935] transition"
        >
          ご予約はこちら
        </a>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.35em] text-[#a39e96] mb-4">ABOUT</p>
          <h2 className="text-2xl font-light text-[#3d3935] mb-10">サロンについて</h2>
          <p className="text-sm leading-[2] text-[#7a746c]">
            Anythingはプライベートサロンです。
            <br />
            <br />
            完全個室の空間で、癒される時間と丁寧な施術を。
            <br />
            メインのシュールエステでは
            <br />
            ソニック(超音波)、キャビテーション、EMS、ラジオ波の複合トリートメントが可能に。
            <br />
            <br />
            一人ひとりのお悩みに寄り添い、理想の美しさと癒しをあなたに。
          </p>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] tracking-[0.35em] text-[#a39e96] mb-4">MENU</p>
            <h2 className="text-2xl font-light text-[#3d3935]">メニュー</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "フェイシャル",
                time: "30分～",
                price: "¥10,500～",
                desc: "超音波やキャビテーションで小顔へ",
              },
              {
                name: "ボディ",
                time: "20分～",
                price: "¥9,000～",
                desc: "筋肉、脂肪をほぐしすっきりとしたボディに",
              },
              {
                name: "セルフ脱毛",
                time: "10分〜",
                price: "¥3,000〜",
                desc: "脱毛しながら肌のケアも",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="bg-white border border-[#e8e4de] rounded-2xl p-8 text-center"
              >
                <h3 className="text-lg font-light text-[#3d3935] mb-3">{m.name}</h3>
                <p className="text-xs text-[#a39e96] mb-1">{m.time}</p>
                <p className="text-[#5c564f] mb-4 tracking-wide">{m.price}</p>
                <p className="text-xs text-[#7a746c] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="/reserve"
              className="inline-block border border-[#c4bdb3] text-[#5c564f] px-8 py-3 rounded-full text-xs tracking-[0.15em] hover:bg-white transition"
            >
              メニューから予約する
            </a>
          </div>
        </div>
      </section>

      {/* Access */}
      <section id="access" className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.35em] text-[#a39e96] mb-4">ACCESS</p>
            <h2 className="text-2xl font-light text-[#3d3935]">アクセス</h2>
          </div>

          <div className="text-center text-sm text-[#7a746c] leading-[2] mb-10">
            <p>札幌市西区発寒5条3丁目3-2</p>
            <p className="mt-4">TEL：011-668-1666</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#e8e4de]">
            <iframe
              title="サロン地図"
              src="https://maps.google.com/maps?q=東京都渋谷区&z=15&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-[11px] text-[#a39e96] text-center mt-3">
            ※地図は仮の位置です。正式な住所に変更できます
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-16 text-center border-t border-[#e8e4de]">
        <p className="text-xs tracking-[0.2em] text-[#7a746c] mb-6">
          RESERVATION
        </p>
        <a
          href="/reserve"
          className="inline-block bg-[#5c564f] text-[#f7f5f2] px-10 py-3.5 rounded-full text-xs tracking-[0.2em] hover:bg-[#3d3935] transition"
        >
          ご予約はこちら
        </a>
      </section>

      <footer className="py-8 text-center text-[11px] tracking-widest text-[#a39e96]">
        © 2026 Anything
      </footer>
    </div>
  );
}