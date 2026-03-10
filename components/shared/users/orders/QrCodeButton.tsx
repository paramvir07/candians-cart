import QrCodeClient from "@/components/customer/profile/QrCodeClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, X } from "lucide-react";

const QrCodeButton = ({orderId}: {orderId: string}) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
          >
            <QrCode size={14} />
            <span className="hidden sm:inline text-sm">QR code</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm rounded-2xl p-6">
          {/* Close Button */}
          <DialogClose asChild>
            <button className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>

          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-lg font-semibold">
              Your QR Code
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Let others scan this code to instantly connect with your profile.
            </DialogDescription>
          </DialogHeader>

          {/* QR Section */}
          <div className="flex justify-center py-2">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QrCodeClient id={orderId.toString()} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
}

export default QrCodeButton