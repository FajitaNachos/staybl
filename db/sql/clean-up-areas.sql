with new_values as (
   SELECT id, 
          st_simplify(the_geom,.0001) as simple
   from areas
)
update areas as a
  set the_geom = nv.simple
from new_values nv
where nv.id = a.id;