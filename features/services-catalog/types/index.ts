import { Service } from "@prisma/client";

export type ServiceWithAppointments = Service & {
  _count: {
    appointments: number;
  };
};

export type ServiceFormData = {
  name: string;
  description: string;
  category: string;
  price: number;
  durationMin: number;
  active: boolean;
};