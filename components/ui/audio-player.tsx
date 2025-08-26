"use client"

export default function AudioPlayer({ src }: { src: string }) {
    return (
        <div className="w-full max-w-[400px]">
            <audio controls className="w-full">
                <source src={src} />
                Seu navegador não suporta o player de áudio.
            </audio>
        </div>
    )
}
