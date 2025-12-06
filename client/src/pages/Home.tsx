import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-2xl"
      >
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary neon-text">
          SUPER
          <br />
          MALHAS
        </h1>
        <p className="text-xl text-muted-foreground font-mono mb-12">
          SIMULADOR DE CIRCUITOS ELÉTRICOS AVANÇADO
        </p>

        <Link href="/setup">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className=" mt-8 w-100 h-10 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background font-display font-bold text-xl rounded transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.3)] "
          >
            INICIAR SISTEMA
          </motion.button>
        </Link>
      </motion.div>

      <div className="absolute bottom-4 text-xs text-muted-foreground font-mono">
        V1 // APP DE MALHAS // DISCIPLINA DE CIRCUITOS ELÉTRICOS I
      </div>
    </div>
  );
}
