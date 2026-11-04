CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First registered user becomes admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('regional','colombia','mundo','deportes')),
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  gallery text[] NOT NULL DEFAULT '{}',
  video_url text,
  author text NOT NULL DEFAULT 'Redacción',
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.news FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin insert" ON public.news FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update" ON public.news FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete" ON public.news FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX news_cat_pub ON public.news (category, published_at DESC);

INSERT INTO public.news (slug,title,category,excerpt,content,cover_url,gallery,video_url,author,featured,published_at) VALUES
('ibague-festival-folclorico-2026','Ibagué se prepara para una nueva edición del Festival Folclórico Colombiano','regional','La capital musical de Colombia alista desfiles, concursos y conciertos que reunirán a artistas de todo el país durante diez días de fiesta.','<p>La Alcaldía de Ibagué y la Gobernación del Tolima presentaron la programación oficial del Festival Folclórico Colombiano, que este año contará con más de 40 eventos culturales en distintos puntos de la ciudad.</p><h2>Una fiesta para toda la región</h2><p>Los organizadores esperan la visita de más de 150.000 turistas. Habrá desfiles de comparsas, el tradicional reinado y conciertos gratuitos en la Plaza de Bolívar.</p><p>“Queremos que el festival sea una vitrina para los artistas tolimenses y para la economía local”, señaló la secretaria de Cultura.</p><h2>Seguridad y movilidad</h2><p>Se dispondrá de un plan especial de movilidad y más de 800 uniformados acompañarán las actividades.</p>','https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80',ARRAY['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80','https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80','https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80'],'https://www.youtube.com/watch?v=aqz-KE-bpKQ','María Fernanda Rojas',true, now() - interval '2 hours'),
('tolima-cosecha-cafe-record','Caficultores del sur del Tolima reportan cosecha récord este semestre','regional','Municipios como Planadas, Chaparral y Rioblanco lideran la producción con cafés especiales que ya llegan a mercados internacionales.','<p>El Comité Departamental de Cafeteros informó que la producción del segundo semestre superó en un 18% las cifras del año anterior.</p><h2>Cafés especiales</h2><p>El sur del Tolima se consolida como una de las regiones con mejor puntuación en tazas de calidad, con lotes exportados a Japón, Estados Unidos y Europa.</p><p>Los productores destacan el acompañamiento técnico y las buenas condiciones climáticas de la temporada.</p>','https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80','{}',NULL,'Carlos Andrés Méndez',false, now() - interval '5 hours'),
('congreso-aprueba-reforma','Congreso aprueba en último debate proyecto de ley de educación superior','colombia','La iniciativa amplía la cobertura de la matrícula gratuita en universidades públicas y fortalece la financiación de las instituciones regionales.','<p>Con amplia mayoría, la plenaria del Senado aprobó el proyecto que pasa ahora a sanción presidencial.</p><h2>¿Qué cambia?</h2><p>La ley garantiza recursos permanentes para la gratuidad de la matrícula y crea un fondo para infraestructura en universidades de regiones apartadas.</p><p>La Universidad del Tolima sería una de las beneficiadas con nuevos recursos para investigación.</p>','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80','{}',NULL,'Redacción Nacional',false, now() - interval '8 hours'),
('bogota-metro-avance','Primera línea del Metro de Bogotá supera el 70% de avance en obra','colombia','La empresa Metro confirmó que los primeros trenes realizarán pruebas dinámicas en el viaducto antes de finalizar el año.','<p>La obra más grande de la capital avanza según el cronograma, de acuerdo con el último informe de interventoría.</p><h2>Pruebas en el viaducto</h2><p>Los trenes, fabricados en China, ya se encuentran en el patio taller de Bosa, donde se realizan las pruebas estáticas.</p>','https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80','{}',NULL,'Laura Gómez',false, now() - interval '1 day'),
('cumbre-clima-acuerdo','Cumbre climática cierra con acuerdo para proteger la Amazonía','mundo','Más de 190 países firmaron un compromiso para reducir la deforestación y financiar proyectos de conservación en Suramérica.','<p>Tras dos semanas de negociaciones, los delegados alcanzaron un acuerdo que incluye un fondo multilateral para la protección de bosques tropicales.</p><h2>El papel de Colombia</h2><p>La delegación colombiana fue protagonista al proponer mecanismos de pago por servicios ambientales a comunidades indígenas y campesinas.</p>','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80',ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'],NULL,'Agencias',false, now() - interval '1 day 3 hours'),
('mercados-globales-tecnologia','Mercados globales reaccionan al auge de la inteligencia artificial','mundo','Las principales bolsas del mundo registraron alzas impulsadas por empresas tecnológicas y nuevos anuncios de inversión.','<p>Los índices de Nueva York, Londres y Tokio cerraron la semana en terreno positivo.</p><h2>Impacto en América Latina</h2><p>Analistas señalan que la región podría beneficiarse de la llegada de centros de datos y nuevas inversiones en energía renovable.</p>','https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80','{}',NULL,'Agencias',false, now() - interval '2 days'),
('deportes-tolima-clasifica','Deportes Tolima clasifica a los cuadrangulares tras vibrante victoria en el Murillo Toro','deportes','El equipo pijao venció 2-1 en casa y aseguró su cupo entre los ocho mejores del campeonato colombiano.','<p>Ante más de 25.000 aficionados, el Vinotinto y Oro remontó el marcador en el segundo tiempo con goles de cabeza y de tiro libre.</p><h2>Lo que viene</h2><p>El cuerpo técnico destacó la actitud del grupo y se prepara para enfrentar a los rivales más fuertes del torneo.</p><p>La hinchada celebró en las calles de Ibagué hasta altas horas de la noche.</p>','https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80',ARRAY['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80','https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80','https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80'],NULL,'Andrés Felipe Lozano',true, now() - interval '3 hours'),
('atletismo-tolimense-oro','Atleta tolimense gana medalla de oro en los Juegos Bolivarianos','deportes','La fondista de Ibagué se impuso en los 10.000 metros con una marca que la acerca a la clasificación olímpica.','<p>Con un cierre espectacular en la última vuelta, la deportista tolimense subió a lo más alto del podio.</p><h2>Orgullo regional</h2><p>La Liga de Atletismo del Tolima anunció que recibirá un homenaje a su regreso a la ciudad.</p>','https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80','{}',NULL,'Redacción Deportes',false, now() - interval '2 days 4 hours');
