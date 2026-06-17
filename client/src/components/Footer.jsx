export default function Footer() {
  return (
    <footer className="footer">
      <div className="container flex between items-center" style={{ flexWrap: "wrap", gap: 16 }}>
        <div className="brand"><span className="logo">🤝</span> VolunteerMy</div>
        <span>Match. Show up. Make impact. © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
