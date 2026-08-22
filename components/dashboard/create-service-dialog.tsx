"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Scissors, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Category {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  name: string;
  specialities?: string | null;
}

interface CreateServiceDialogProps {
  categories: Category[];
  staff: StaffMember[];
}

export function CreateServiceDialog({
  categories,
  staff,
}: CreateServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [price, setPrice] = useState("50.00");
  const [bufferBefore, setBufferBefore] = useState("0");
  const [bufferAfter, setBufferAfter] = useState("5");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryId("");
    setDurationMinutes("45");
    setPrice("50.00");
    setBufferBefore("0");
    setBufferAfter("5");
    setSelectedStaffIds([]);
    setIsActive(true);
  };

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a service name");
      return;
    }
    const dur = parseInt(durationMinutes, 10);
    if (isNaN(dur) || dur <= 0) {
      toast.error("Please enter a valid time");
      return;
    }

    const pr = parseFloat(price);
    if (isNaN(pr) || pr < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          durationMinutes: dur,
          price: pr.toFixed(2),
          currency: "USD",
          bufferBefore: parseInt(bufferBefore, 10) || 0,
          bufferAfter: parseInt(bufferAfter, 10) || 0,
          isActive,
          assignedStaffIds: selectedStaffIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create service");
        return;
      }
      toast.success("Service created successfully!");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error("An error occurred while creating the service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-137.5">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Add New Service
            </DialogTitle>
            <DialogDescription>
              Create a new service offering and assign team members who perform
              it.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="service-name"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Service Name *
              </label>
              <Input
                id="service-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Signature Beard Styling"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Duration (min) *
                </label>
                <div className="relative">
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                  />
                  <Clock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Price ($) *
                </label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.5"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <DollarSign className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="bufferBefore"
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                >
                  Buffer Before (min)
                </label>
                <Input
                  id="bufferBefore"
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="bufferAfter"
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                >
                  Buffer After (min)
                </label>
                <Input
                  id="bufferAfter"
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="service-desc"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Description (optional)
              </label>
              <textarea
                id="service-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the service..."
                rows={2}
                className="flex min-h-17.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Assign Staff Members (Optional)
              </label>
              {staff.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No active staff members found.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 bg-muted/20">
                  {staff.map((s) => {
                    const isSelected = selectedStaffIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleStaffToggle(s.id)}
                        className={`flex items-center gap-2 rounded-md border p-2 text-left text-xs transform-colors cursor-pointer ${isSelected ? "border-primary bg-primary/10 text-primary font-medium" : "border-transparent bg-card hover:border-input"}`}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                        >
                          {isSelected ? "✓" : ""}
                        </div>

                        <span className="truncate">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label
                htmlFor="is-active"
                className="text-xs font-medium text-foreground cursor-pointer"
              >
                Publish as Active (Available for online booking)
              </label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Service"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
