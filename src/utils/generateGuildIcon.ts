import Canvas from "@napi-rs/canvas";

export function generateGuildIcon(name: string) {
	const text = name
		.split(/ +/g)
		.map((word) => word[0]!)
		.join("");
	const canvas = Canvas.createCanvas(256, 256);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "rgb(170,170,170)";
	ctx.fillRect(0, 0, 256, 256);

	ctx.fillStyle = "black";
	ctx.font = "bold 68px DejaVu Sans";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillText(text, 128, 128);

	return canvas.toBuffer("image/png");
}
