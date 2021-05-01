var animations = {}; //all animations container

function loadAnimation( name, url ) {
	var anim = new RD.SkeletalAnimation();
	anim.load(url);
	animations[ name ] = anim;
}

loadAnimation("idle", "data/anims/girl_idle.skanim");
loadAnimation("walking", "data/anims/girl_walking.skanim");
loadAnimation("dancing_twist", "data/anims/girl_dancing_twist.skanim");
loadAnimation("dancing_hiphop", "data/anims/girl_dancing_hiphop.skanim");
loadAnimation("dancing_macarena", "data/anims/girl_dancing_macarena.skanim");
loadAnimation("dancing_tembleque", "data/anims/girl_dancing_tembleque.skanim");
loadAnimation("cheering", "data/anims/girl_cheering_rock.skanim");
loadAnimation("cheering_rock", "data/anims/girl_cheering.skanim");
loadAnimation("clapping", "data/anims/girl_clapping.skanim");
loadAnimation("hands up", "data/anims/girl_waving.skanim");
loadAnimation("NO", "data/anims/girl_waving_no.skanim");
loadAnimation("waiting", "data/anims/girl_waiting.skanim");
loadAnimation("waving", "data/anims/girl_waving_energic.skanim");

const dances = ["dancing_twist", "dancing_hiphop", "dancing_macarena", "dancing_tembleque", "cheering", "cheering_rock", "clapping", "hands up", "NO"];

//we need an skeletonm if we plan to do blending
var skeleton = new RD.Skeleton(); //skeleton for blending