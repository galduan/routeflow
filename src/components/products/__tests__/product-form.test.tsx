import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductForm } from "../product-form";
import { expect, vi, it, describe } from "vitest";

describe("ProductForm", () => {
  it("renders correctly with default values", () => {
    render(<ProductForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<ProductForm onSubmit={vi.fn()} />);
    
    fireEvent.click(screen.getByRole("button", { name: /Create Product/i }));

    await waitFor(() => {
      expect(screen.getByText(/SKU is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct data when valid", async () => {
    const handleSubmit = vi.fn();
    render(<ProductForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: "TEST-001" } });
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "Eggs" } });
    fireEvent.change(screen.getByLabelText(/Unit/i), { target: { value: "Tray" } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: "10.5" } });

    fireEvent.click(screen.getByRole("button", { name: /Create Product/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      const submittedData = handleSubmit.mock.calls[0][0];
      expect(submittedData).toMatchObject({
        sku: "TEST-001",
        name: "Test Product",
        price: 10.5,
      });
    });
  });
});
