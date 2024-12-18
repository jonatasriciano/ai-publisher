// publishController.js
// Controller to handle publishing logic for posts.

export async function publishPost(postId) {
  const postIndex = (global.pendingPosts || []).findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return { error: 'Post not found.' };
  }

  const post = global.pendingPosts[postIndex];

  if (!post.approvedByTeam || !post.approvedByClient) {
    return { error: 'Post not fully approved yet.' };
  }

  console.log(`Publishing post to ${post.platform}`);
  console.log(`Caption: ${post.caption}`);
  console.log(`Tags: ${post.tags.join(', ')}`);

  global.pendingPosts.splice(postIndex, 1);

  return { post };
}