package com.Mysco.Logos.repository;

import com.Mysco.Logos.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
            select comment
            from Comment comment
            join fetch comment.author
            where comment.post.id = :postId
            order by comment.createdAt asc
            """)
    List<Comment> findByPostIdWithAuthorOrderByCreatedAtAsc(@Param("postId") Long postId);
}
