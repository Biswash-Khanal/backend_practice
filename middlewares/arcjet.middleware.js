import aj from "../config/arcjet.js";



const arcjetMiddleware = async (req, res, next) => {
	try {
		const decision = await aj.protect(req,{requested:1});

		if (decision.isDenied()) {
			if (decision.reason.isRateLimit) {
				return res.status(429).json({ error: "ratelimit exceeded" });
			}
			if (decision.reason.isBot()) {
				return res.status(403).json({ error: "bot detected" });
			}

			return res.status(403).json({ error: "AccessDenied" });
		}

		next();

	} catch (error) {
		console.log(`arcjet middleware eerror: ${error}`);
		next(error);
	}
};


export default arcjetMiddleware;