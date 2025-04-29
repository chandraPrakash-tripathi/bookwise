"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { borrowBook } from "@/lib/actions/book";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";

interface Props {
  userId: string;
  bookId: string;
  libraryId: string; // Added libraryId
  deliveryAddresses?: Array<{
    id: string;
    fullName: string;
    addressLine1: string;
    city: string;
  }>;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
}

const BookBorrow = ({
  userId,
  bookId,
  libraryId, 
  deliveryAddresses = [],
  borrowingEligibility: { isEligible, message },
}: Props) => {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"TAKEAWAY" | "DELIVERY">("TAKEAWAY");
  const [deliveryAddressId, setDeliveryAddressId] = useState<string | undefined>();
  const [notes, setNotes] = useState<string | undefined>();

  const handleOpenDialog = () => {
    if (!isEligible) {
      toast.error(message);
      return;
    }
    setIsDialogOpen(true);
  };

  const handleBorrow = async () => {
    setBorrowing(true);
    try {
      // Prepare the parameters according to BorrowBookParams interface
      const borrowParams = {
        userId,
        bookId,
        libraryId, // Include libraryId
        deliveryMethod,
        deliveryAddressId: deliveryMethod === "DELIVERY" ? deliveryAddressId : undefined,
        notes,
      };

      const result = await borrowBook(borrowParams);
      if (result.success) {
        toast.success("Book borrowed successfully");
        router.push("/my-profile");
      } else {
        toast.error(result.message || "Failed to borrow book");
      }
    } catch (error) {
      console.error("Error borrowing book:", error);
      toast.error("Something went wrong");
    } finally {
      setBorrowing(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button className="bg-yellow-200 " onClick={handleOpenDialog}>
        <Image src="/icons/book.svg" alt="book" width={22} height={22} className="mr-2" />
        <p className="text-black"> Borrow Book</p>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow Options</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup 
              value={deliveryMethod} 
              onValueChange={(value) => setDeliveryMethod(value as "TAKEAWAY" | "DELIVERY")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TAKEAWAY" id="takeaway" />
                <Label htmlFor="takeaway">Pick up from library</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DELIVERY" id="delivery" />
                <Label htmlFor="delivery">Request delivery</Label>
              </div>
            </RadioGroup>

            {deliveryMethod === "DELIVERY" && (
              <div className="mt-4">
                <Label htmlFor="address">Select delivery address</Label>
                <Select 
                  value={deliveryAddressId} 
                  onValueChange={setDeliveryAddressId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an address" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryAddresses.length > 0 ? (
                      deliveryAddresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.fullName} - {address.addressLine1}, {address.city}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No addresses available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {deliveryAddresses.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Please add a delivery address in your profile first.
                  </p>
                )}
              </div>
            )}
            
            <div className="mt-4">
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions?"
                value={notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBorrow} 
              disabled={borrowing || (deliveryMethod === "DELIVERY" && !deliveryAddressId)}
              className="bg-yellow-200"
            >
              {borrowing ? "Processing..." : "Confirm Borrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookBorrow;