-- News media is exposed to readers through signed URLs stored with each article.
-- Do not grant anonymous users permission to enumerate the private media bucket.
DROP POLICY IF EXISTS "media public read" ON storage.objects;
CREATE POLICY "media admin read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
