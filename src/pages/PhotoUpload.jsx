import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const inputCls =
    'w-full rounded-xl bg-white border border-slate-300 text-black ' +
    'placeholder:text-slate-600 px-4 py-3 outline-none focus:ring-2 focus:ring-primary'
const labelCls = 'block text-sm text-forest mb-1 font-semibold'

export default function PhotoUpload() {
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    const handleFileChange = (e) => {
        setPhotos(Array.from(e.target.files))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setError(null)

        const formData = new FormData()
        formData.append('full_name', fullName)
        formData.append('phone_number', phone)
        photos.forEach((photo) => {
            formData.append('photos', photo)
        })

        try {
            // Using the generic post helper from our client
            const data = await api.post('/guest-photo-upload/', formData)

            setMessage({
                text: data.message,
                points: data.points_earned
            })
            setFullName('')
            setPhone('')
            setPhotos([])

        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-28 md:pt-32 pb-12 bg-offwhite min-h-screen">
            <div className="mx-auto max-w-xl px-4">
                <div className="bg-white rounded-3xl border border-forest/10 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-forest">Upload & Earn</h1>
                            <p className="text-forest/70">Share your H2H memories</p>
                        </div>
                    </div>

                    <p className="text-forest/80 mb-8 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        Every photo you upload earns you <b>10 Points</b>! Use these points for future discounts and perks.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={inputCls}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={inputCls}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Select Photos</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    required
                                />
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center group-hover:border-primary transition-colors">
                                    <span className="material-symbols-outlined text-slate-400 text-4xl mb-2 group-hover:text-primary">cloud_upload</span>
                                    <p className="text-sm text-forest/60">Click to browse or drag photos here</p>
                                    <p className="text-xs text-slate-400 mt-1">Images only (JPG, PNG)</p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-forest/60">
                                {photos.length > 0 ? (
                                    <span className="text-primary font-bold">{photos.length} photos selected</span>
                                ) : (
                                    'No photos selected'
                                )}
                            </p>
                        </div>

                        {photos.length > 0 && (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                                <span className="text-sm font-bold text-emerald-700">Earnings for this upload:</span>
                                <span className="text-xl font-black text-emerald-700">{photos.length * 10} Points</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-6 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl shadow-inner animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-2xl font-bold">check_circle</span>
                                    <h3 className="font-bold text-lg">Upload Successful!</h3>
                                </div>
                                <p className="text-sm opacity-90">{message.text}</p>
                                <div className="mt-4 pt-4 border-t border-emerald-200 flex justify-between items-center">
                                    <span className="text-sm">Total Points Earned:</span>
                                    <span className="text-2xl font-black">{message.points} 🎉</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !fullName || !phone || photos.length === 0}
                            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${loading || !fullName || !phone || photos.length === 0
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                'Upload Photos & Earn Points'
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/" className="text-forest/60 hover:text-primary text-sm underline transition-colors">
                                Back to Home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
