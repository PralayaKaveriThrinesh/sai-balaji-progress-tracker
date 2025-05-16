
import { ProgressPhoto } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface PhotoPreviewProps {
  photo: ProgressPhoto;
  onRemove?: () => void;
}

export function PhotoPreview({ photo, onRemove }: PhotoPreviewProps) {
  // Format timestamp to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <Card className="overflow-hidden relative group">
      <img
        src={photo.dataUrl}
        alt="Captured"
        className="w-full aspect-video object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
        <div className="text-sm">
          <div>{formatDate(photo.timestamp)}</div>
          <div className="text-xs">
            GPS: {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
          </div>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove photo"
        >
          ✕
        </button>
      )}
    </Card>
  );
}
