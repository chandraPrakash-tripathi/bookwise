import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, DollarSign, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CardInfo {
  title: string;
  icon: React.ReactNode;
  description: string;
  button: string;
  link: string;
}

const HomePage: React.FC = () => {
  const cardData: CardInfo[] = [
    {
      title: "Want to Borrow Books",
      icon: <BookOpen size={40} className="text-indigo-600" />,
      description: "Explore and borrow books from our vast collection.",
      button: "Borrow Now",
      link: "/user"
    },
    {
      title: "Want to Sell Books",
      icon: <DollarSign size={40} className="text-green-600" />,
      description: "Sell your old books and help others learn.",
      button: "Sell Now",
      link: "/library"
    },
    {
      title: "Admin",
      icon: <Shield size={40} className="text-red-600" />,
      description: "Admin access to manage books and users.",
      button: "Login as Admin",
      link: "/admin"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 py-16 px-6 md:px-20">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Welcome to BookWise</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all"
          >
            {card.icon}
            <h2 className="mt-4 text-xl font-semibold text-gray-800">{card.title}</h2>
            <p className="mt-2 text-gray-500">{card.description}</p>
            <Button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium" onClick={() => window.location.href = card.link}>
              {card.button}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
