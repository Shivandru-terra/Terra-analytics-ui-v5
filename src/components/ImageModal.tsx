import { Dialog, DialogContent } from '@/components/ui/dialog';
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, altText }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <Zoom>
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-auto object-contain max-h-[70vh]"
          />
        </Zoom>
      </DialogContent>
    </Dialog>
  );
} 