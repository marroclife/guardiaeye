import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-marroc-muscgo">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-display font-bold text-marroc-dourado">404</h1>
        <p className="mb-6 text-xl text-marroc-salvia/70 font-light">Página não encontrada</p>
        <a 
          href="/" 
          className="inline-block btn-marroc"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
