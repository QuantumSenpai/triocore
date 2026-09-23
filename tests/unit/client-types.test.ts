import { describe, it, expect } from "vitest";
import { clientCreateSchema, clientEditSchema, clientTypeValues } from "@/lib/validations/crm";

describe("Client Type Validations & Dropdown Options", () => {
  it("defines the exact 4 required client types", () => {
    expect(clientTypeValues).toEqual(["Company", "Brand", "Startup", "Individual"]);
  });

  it("validates client creation with each of the 4 allowed types", () => {
    for (const type of clientTypeValues) {
      const res = clientCreateSchema.safeParse({
        name: `Test Client ${type}`,
        company: type,
      });
      expect(res.success).toBe(true);
    }
  });

  it("permits null or empty client type (unassigned / not set)", () => {
    const resEmpty = clientCreateSchema.safeParse({
      name: "Empty Type Client",
      company: "",
    });
    expect(resEmpty.success).toBe(true);

    const resNull = clientCreateSchema.safeParse({
      name: "Null Type Client",
      company: null,
    });
    expect(resNull.success).toBe(true);
  });

  it("rejects invalid client types outside the 4 allowed types", () => {
    const res = clientCreateSchema.safeParse({
      name: "Invalid Client",
      company: "EnterpriseCorpNotAllowed",
    });
    expect(res.success).toBe(false);

    const resLegacy = clientCreateSchema.safeParse({
      name: "Legacy Client",
      company: "lawdaaa",
    });
    expect(resLegacy.success).toBe(false);
  });

  it("validates client edit schema with allowed types", () => {
    const res = clientEditSchema.safeParse({
      id: "client-123",
      name: "Updated Client",
      company: "Startup",
    });
    expect(res.success).toBe(true);
  });
});
