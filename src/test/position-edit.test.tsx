import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PositionRow } from "@/components/trading/PositionRow";
import type { Position } from "@/lib/trading";

const position: Position = { id: "1", symbol: "TSLA", side: "long", qty: 1, entry: 391.62, sl: 380, tp: 420, openedAt: 1, entryCommission: 1.96, journal: { reason: "test", emotion: "", notes: "" } };

describe("position editor", () => {
  it("submits the 2% TP with the current SL", async () => {
    const onEdit = vi.fn().mockResolvedValue(true);
    const view = render(<PositionRow position={position} price={395} busy={false} onEdit={onEdit} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect((screen.getByLabelText("SL TSLA") as HTMLInputElement).value).toBe("380");
    expect((screen.getByLabelText("TP TSLA") as HTMLInputElement).value).toBe("420");
    fireEvent.change(screen.getByLabelText("TP por % de ganancia TSLA"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(380, 399.45));
    view.unmount();
  });
  it("does not submit invalid current-price levels", () => {
    const onEdit = vi.fn();
    const view = render(<PositionRow position={position} price={395} busy={false} onEdit={onEdit} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("TP TSLA"), { target: { value: "394" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onEdit).not.toHaveBeenCalled();
    view.unmount();
  });
  it("cancel discards changes without saving", () => {
    const onEdit = vi.fn();
    const view = render(<PositionRow position={position} price={395} busy={false} onEdit={onEdit} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("TP TSLA"), { target: { value: "400" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect((screen.getByLabelText("TP TSLA") as HTMLInputElement).value).toBe("420");
    expect(onEdit).not.toHaveBeenCalled();
    view.unmount();
  });
});