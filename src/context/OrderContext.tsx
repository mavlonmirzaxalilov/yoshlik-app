import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { OrderType, PaymentMethod } from "../types";
import { CAFE_LOCATION, getCurrentLocation, haversineDistanceKm, type LatLng } from "../lib/geo";

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";

interface OrderContextValue {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  address: string;
  setAddress: (address: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;

  location: LatLng | null;
  locationStatus: LocationStatus;
  locationError: string | null;
  distanceKm: number | null;
  requestLocation: () => Promise<void>;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  const distanceKm = useMemo(
    () => (location ? haversineDistanceKm(CAFE_LOCATION, location) : null),
    [location]
  );

  const requestLocation = async () => {
    setLocationStatus("loading");
    setLocationError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setLocationStatus("granted");
    } catch (err) {
      const isDenied =
        err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED;
      setLocationStatus(isDenied ? "denied" : "error");
      setLocationError(
        isDenied
          ? "Joylashuvga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering."
          : "Joylashuvni aniqlab bo'lmadi. Qayta urinib ko'ring."
      );
    }
  };

  const value: OrderContextValue = {
    orderType,
    setOrderType,
    address,
    setAddress,
    paymentMethod,
    setPaymentMethod,
    location,
    locationStatus,
    locationError,
    distanceKm,
    requestLocation,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder OrderProvider ichida ishlatilishi kerak");
  return ctx;
}
