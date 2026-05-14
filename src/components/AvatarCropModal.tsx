"use client";

import ImageEditor from "@/components/ui/ImageEditor";

interface Props {
  imageSrc: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
}

export default function AvatarCropModal({ imageSrc, onSave, onCancel }: Props) {
  return (
    <ImageEditor
      open={!!imageSrc}
      imageSrc={imageSrc}
      aspect={1}
      maxOutputPx={800}
      cropShape="round"
      title="Crop profile photo"
      outputQuality={0.92}
      onCancel={onCancel}
      onApply={(blob) => onSave(blob)}
    />
  );
}
