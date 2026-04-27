CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id),

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_comments_post_created_at
    ON comments(post_id, created_at);
