"use client"

import Modal from "@modules/common/components/modal"
import Image from "next/image"

// Просмотр одного изображения в модалке: подпись + крестик даёт общий Modal
// стартера, внутри — фото, вписанное по высоте окна. Используется карточкой
// товара в чате ассистента (тап по фото — просмотр, тап по карточке — выбор).
const ImageLightbox = ({
  isOpen,
  close,
  src,
  alt,
  title,
}: {
  isOpen: boolean
  close: () => void
  src: string
  alt: string
  title?: string
}) => {
  return (
    <Modal
      isOpen={isOpen}
      close={close}
      size="large"
      data-testid="image-lightbox"
    >
      {title && <Modal.Title>{title}</Modal.Title>}
      <Modal.Body>
        <div className="relative mt-3 flex w-full justify-center">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={1200}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto max-h-[60vh] w-auto rounded-card object-contain"
            data-testid="image-lightbox-image"
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ImageLightbox
