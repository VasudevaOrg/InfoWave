import "./globals.css";

export const metadata = {
  title: "InfoWave Computer Training Center | Learn, Grow, Succeed",
  description: "InfoWave is the premier computer training institute in Kothakota village, Ravikamatham Mandal, Anakapalli District. We offer DCA, PGDCA, Tally, MS Office, Python, Photoshop, C & C++, and Typing courses with professional certification.",
  keywords: "InfoWave, computer institute, DCA, PGDCA, Tally, coding classes, Anakapalli, Kothakota, Ravikamatham, Gummudu Srinivasarao, computer training center",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
