import { motion } from "framer-motion";

export default function StudioFooter() {
  return (
    <footer className="signature">
      <motion.strong
        className="signature-text"
        whileHover={{
          scale: 1.045,
          filter: "drop-shadow(0 0 30px rgba(189, 105, 255, .95))",
        }}
        transition={{ duration: 0.35 }}
      >
        DESENVOLVIDO PELO GORDÃO
      </motion.strong>
    </footer>
  );
}
