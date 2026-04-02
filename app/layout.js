export const metadata = {
  title: "Festival Planner",
  description: "Plan your festival like a pro",
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}