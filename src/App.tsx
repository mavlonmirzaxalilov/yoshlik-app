import { useEffect, useState } from "react";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { initTelegram } from "./lib/telegram";
import { MenuScreen } from "./screens/MenuScreen";
import { CartScreen } from "./screens/CartScreen";
import { OrderScreen } from "./screens/OrderScreen";
import { SuccessScreen } from "./screens/SuccessScreen";

type Screen = "menu" | "cart" | "order" | "success";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");

  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <div className="min-h-dvh bg-[#F7F7F8]">
          {screen === "menu" && (
            <MenuScreen onOpenCart={() => setScreen("cart")} />
          )}
          {screen === "cart" && (
            <CartScreen
              onBack={() => setScreen("menu")}
              onCheckout={() => setScreen("order")}
            />
          )}
          {screen === "order" && (
            <OrderScreen
              onBack={() => setScreen("cart")}
              onOrderPlaced={() => setScreen("success")}
            />
          )}
          {screen === "success" && (
            <SuccessScreen onBackToMenu={() => setScreen("menu")} />
          )}
        </div>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;
