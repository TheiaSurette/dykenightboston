/**
 * Revalidate cache tags by calling the revalidation API endpoint
 * This is used by Payload CMS hooks to trigger on-demand revalidation
 */
export async function revalidateCacheTags(tags: string[]): Promise<void> {
  // Don't attempt revalidation if we're in build mode or required env vars are missing
  if (!process.env.NEXT_PUBLIC_SITE_URL || !process.env.REVALIDATE_SECRET) {
    console.log('Skipping revalidation: Missing NEXT_PUBLIC_SITE_URL or REVALIDATE_SECRET');
    return;
  }

  const revalidateUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`;

  try {
    const response = await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.REVALIDATE_SECRET,
        tags,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to revalidate cache:', error);
      return;
    }

    const result = await response.json();
    console.log('Successfully revalidated cache tags:', result.tags);
  } catch (error) {
    // Log the error but don't throw - we don't want to block CMS operations
    console.error('Error calling revalidation endpoint:', error);
  }
}

