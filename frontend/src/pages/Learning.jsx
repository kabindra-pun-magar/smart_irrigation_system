import React, { useState, useRef } from "react";
import "../styles/Learning.css";

export default function Learning() {
  const [videos, setVideos] = useState([
    {
      id: 1,
      type: 'youtube',
      url: 'https://www.youtube.com/embed/LGF33NN4B8U',
      title: 'Modern Farming Techniques',
      thumbnail: 'https://img.youtube.com/vi/LGF33NN4B8U/maxresdefault.jpg',
      description: 'Learn about modern farming methods and sustainable agriculture',
      duration: '15:30',
      views: '2.5K views',
      date: '2024-03-25'
    },
    {
      id: 2,
      type: 'youtube',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Organic Farming Guide',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description: 'Complete guide to organic farming practices',
      duration: '22:15',
      views: '1.8K views',
      date: '2024-03-24'
    },
    {
      id: 3,
      type: 'youtube',
      url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
      title: 'Smart Agriculture Technology',
      thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
      description: 'Explore how technology is revolutionizing farming',
      duration: '18:45',
      views: '3.2K views',
      date: '2024-03-23'
    }
  ]);

  const [localVideos, setLocalVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'all', name: 'All Videos', icon: '🌾' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'local', name: 'Local', icon: '📱' }
  ];

  const handleLocalVideoUpload = (event) => {
    const files = Array.from(event.target.files);
    const newVideos = files.map((file, index) => ({
      id: localVideos.length + index + 1,
      type: 'local',
      url: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: `Local video uploaded on ${new Date().toLocaleDateString()}`,
      size: (file.size / (1024 * 1024)).toFixed(2),
      duration: '0:00',
      views: '0 views',
      date: new Date().toISOString().split('T')[0],
      file: file
    }));
    setLocalVideos([...localVideos, ...newVideos]);
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const deleteVideo = (videoId, isLocal = false) => {
    if (isLocal) {
      setLocalVideos(localVideos.filter(video => video.id !== videoId));
    } else {
      setVideos(videos.filter(video => video.id !== videoId));
    }
  };

  const getFilteredVideos = () => {
    const allVideos = [...videos, ...localVideos];
    if (activeCategory === 'all') return allVideos;
    if (activeCategory === 'youtube') return videos;
    if (activeCategory === 'local') return localVideos;
    return allVideos;
  };

  const filteredVideos = getFilteredVideos();

  return (
    <div className="learning-page">
      {/* Glass Background Effect */}
      <div className="glass-bg"></div>
      
      {/* Page Header with Glass Effect */}
      <div className="page-header glass-card">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🌾</span>
            Farm Learning Hub
            <span className="title-icon">📚</span>
          </h1>
          <p className="page-description">
            Discover modern farming techniques, sustainable practices, and agricultural innovations
          </p>
        </div>
        
        {/* Upload Button */}
        <div className="header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLocalVideoUpload}
            accept="video/*"
            multiple
            style={{ display: 'none' }}
          />
          <button 
            className="upload-video-btn glass-btn"
            onClick={() => fileInputRef.current.click()}
          >
            <span className="btn-icon">📹</span>
            Upload Video
            <span className="btn-glow"></span>
          </button>
        </div>
      </div>

      {/* Stats Cards with Glass Effect */}
      <div className="stats-cards">
        <div className="stat-card glass-card">
          <div className="stat-icon">📺</div>
          <div className="stat-info">
            <div className="stat-number">{videos.length + localVideos.length}</div>
            <div className="stat-label">Total Videos</div>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">▶️</div>
          <div className="stat-info">
            <div className="stat-number">{videos.length}</div>
            <div className="stat-label">YouTube Videos</div>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            <div className="stat-number">{localVideos.length}</div>
            <div className="stat-label">Local Videos</div>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <div className="stat-number">
              {videos.reduce((acc, v) => acc + (parseInt(v.views) || 0), 0) + 
               localVideos.reduce((acc, v) => acc + 0, 0)}K
            </div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>
      </div>

      {/* Category Tabs with Glass Effect */}
      <div className="category-tabs glass-card">
        {categories.map(category => (
          <button
            key={category.id}
            className={`tab-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="tab-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        {filteredVideos.map((video) => (
          <div key={video.id} className="video-card glass-card">
            <div className="video-thumbnail-wrapper">
              {video.type === 'youtube' ? (
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="video-thumbnail"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/640x360?text=Video+Thumbnail';
                  }}
                />
              ) : (
                <video 
                  src={video.url} 
                  className="video-thumbnail"
                  style={{ objectFit: 'cover' }}
                />
              )}
              <div className="video-duration">{video.duration}</div>
              <div className="video-type-tag">
                {video.type === 'youtube' ? 'YouTube' : 'Local'}
              </div>
              <div className="video-overlay">
                <button 
                  className="play-btn-overlay"
                  onClick={() => openVideoModal(video)}
                >
                  ▶
                </button>
              </div>
            </div>
            
            <div className="video-details">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-description">{video.description}</p>
              <div className="video-meta">
                <span className="video-views">👁️ {video.views}</span>
                <span className="video-date">📅 {video.date}</span>
                {video.type === 'local' && video.size && (
                  <span className="video-size">💾 {video.size} MB</span>
                )}
              </div>
              <div className="video-actions">
                <button 
                  className="watch-now-btn"
                  onClick={() => openVideoModal(video)}
                >
                  Watch Now →
                </button>
                <button 
                  className="delete-video-btn"
                  onClick={() => deleteVideo(video.id, video.type === 'local')}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="empty-learning-state glass-card">
          <div className="empty-icon">🎬</div>
          <h3>No videos found</h3>
          <p>
            {activeCategory === 'all' 
              ? "Start your farming education journey by uploading your first video" 
              : activeCategory === 'youtube' 
                ? "No YouTube videos available in the library" 
                : "No local videos uploaded yet"}
          </p>
          {(activeCategory === 'all' || activeCategory === 'local') && (
            <button 
              className="upload-first-btn glass-btn"
              onClick={() => fileInputRef.current.click()}
            >
              Upload Your First Video
            </button>
          )}
        </div>
      )}

      {/* Video Modal */}
      {isModalOpen && selectedVideo && (
        <div className="video-modal-overlay" onClick={closeModal}>
          <div className="video-modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedVideo.title}</h2>
              <button className="close-modal-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-video-wrapper">
              {selectedVideo.type === 'youtube' ? (
                <iframe
                  src={selectedVideo.url}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  controls
                  autoPlay
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="modal-footer">
              <p>{selectedVideo.description}</p>
              <div className="modal-meta">
                <span>👁️ {selectedVideo.views}</span>
                <span>⏱️ {selectedVideo.duration}</span>
                <span>📅 {selectedVideo.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}