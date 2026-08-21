import { useState, useEffect, useRef } from "react";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { MenuScreen } from "./screens/MenuScreen";
import { CartScreen } from "./screens/CartScreen";
import { OrderScreen } from "./screens/OrderScreen";
import { SuccessScreen } from "./screens/SuccessScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { TabBar } from "./components/TabBar";
import { parseTwemoji } from "./lib/twemoji";
import { loadPricingSettings } from "./lib/pricing";

type Screen = "menu" | "cart" | "order" | "success" | "profile";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPricingSettings();
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      parseTwemoji(rootRef.current);
    }
  });

  return (
    <CartProvider>
      <OrderProvider>
        <div ref={rootRef} className="min-h-dvh bg-[#F7F7F8]">
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
              onOrderPlaced={(number) => {
                setOrderNumber(number);
                setScreen("success");
              }}
            />
          )}
          {screen === "success" && (
            <SuccessScreen
              orderNumber={orderNumber}
              onBackToMenu={() => setScreen("menu")}
            />
          )}
          {screen === "profile" && <ProfileScreen />}

          {(screen === "menu" || screen === "profile") && (
            <TabBar
              active={screen === "profile" ? "profile" : "menu"}
              onNavigate={setScreen}
            />
          )}
        </div>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;