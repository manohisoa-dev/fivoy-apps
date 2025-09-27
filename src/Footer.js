export default function Footer() {
  return (
    <footer className="w-full text-center text-sm text-gray-600">
      © {new Date().getFullYear()}  Copyright – Fivoy | Développé par 
      <a
        href="https://www.facebook.com/rakotondrasata.andriamanohisoa" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        &nbsp; Manou
      </a>
    </footer>
  );
}