import { Camera, ImagePlus, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPublicFileUrl } from '../services/api';
import api from '../services/api';
import { uploadProfileImage } from '../services/cloudinary';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfilePage() {
  const { user, updateProfilePicture } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError('');
    setSuccess('');
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setError('Choose a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setSelectedFile(null);
      setError('Profile pictures must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Choose an image before saving your profile picture.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const imageUrl = await uploadProfileImage(selectedFile);
      const response = await api.put('/users/me/profile-picture', { profilePictureUrl: imageUrl });
      updateProfilePicture(response.data.profilePictureUrl);
      setSelectedFile(null);
      setSuccess('Your profile picture has been updated.');
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message
        || requestError.response?.data?.message
        || requestError.message
        || 'We could not update your picture. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const currentPicture = previewUrl || getPublicFileUrl(user?.profilePictureUrl);

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow"><Camera size={14} /> Account profile</span>
          <h1 className="page-heading">Your TechieTutor profile.</h1>
          <p>Update the picture shown to students, tutors, and administrators across the platform.</p>
        </div>
      </div>

      <form className="form-card profile-picture-card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
        {success && <div className="alert alert-success page-alert" role="status">{success}</div>}

        <div className="profile-picture-preview">
          {currentPicture
            ? <img src={currentPicture} alt={`${user?.name || 'Your'} profile`} />
            : <span aria-hidden="true">{user?.name?.trim()?.charAt(0)?.toUpperCase() || <ImagePlus size={32} />}</span>}
        </div>
        <div className="profile-picture-details">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className="badge badge-primary">{user?.role}</span>
          <div className="field-group profile-picture-file">
            <label className="field-label" htmlFor="profile-picture">Choose a profile picture</label>
            <input
              id="profile-picture"
              className="input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              aria-describedby="profile-picture-help"
            />
            <small id="profile-picture-help" className="field-help">JPG, PNG, or WebP · maximum 5 MB</small>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving || !selectedFile}>
            {saving ? <><Loader2 size={16} className="loading-dots" /> Saving picture...</> : <><Upload size={16} /> Save picture</>}
          </button>
        </div>
      </form>
    </div>
  );
}
