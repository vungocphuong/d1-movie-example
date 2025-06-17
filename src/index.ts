import { Hono } from "hono"

type Bindings = {
	DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()
//both as json
//Get /movies => return all movies
app.get("/movies", async c => {
	const resp = await c.env.DB.prepare("SELECT * from movies").all()
	const movies = resp.results
	return c.json(movies)
})
//Get /favorites => return 3 favorite movies (sorted by rating)
app.get("/favorites", async c => {
	const resp = await c.env.DB.prepare("SELECT * from movies order by rating desc limit 3").all()
	const movies = resp.results
	return c.json(movies)
})
//Put /movies/:id => re-rate a movie
app.put("/movie/:id", async c => {
	const body = await c.req.json()
	const resp = await c.env.DB
		.prepare("UPDATE movies SET rating = ?1 WHERE id = ?2 RETURNING *")
		.bind(body.rating, c.req.param("id"))
		.run()
	const ok = resp.success
	return c.json({ ok })
})

export default app