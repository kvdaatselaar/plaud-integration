---
title: "2026-06-08 17:00 — 06-08 Meeting: MLflow Demo, Gateways/PII, Compliance, AI SDLC Reference Architecture, Harness Framework, DevOps Pipelines, LLM Hosting Costs"
date: 2026-06-08
time: "17:00"
duration_min: 60
plaud_id: 19e7d1c6b6ce947f08118107381d9a4d
source: plaud
---

# 2026-06-08 17:00 — 06-08 Meeting: MLflow Demo, Gateways/PII, Compliance, AI SDLC Reference Architecture, Harness Framework, DevOps Pipelines, LLM Hosting Costs

- **Datum:** 2026-06-08 17:00
- **Duur:** 60 min

## Transcript

[0:01] Emilio Oldenziel: But yeah, that's also part of the show. And maybe for one of the building blocks is MLflow. This is a demo of MLflow with all the traces. So what I did, I pulled my VS Code traces that I put in my in my VS Code. I've also inserted that with a script line. And now I can see all the traces that I've done while it's only five a few days ago.

[0:31] Emilio Oldenziel: Yeah. With all the turn data. That's.

[0:37] Speaker 2: Looking in the local session.

[0:40] Emilio Oldenziel: Yeah, so everything that happened, so how the LLM was called with a tool loop, what are wrong?

[0:46] Speaker 2: It has a window for it now. It actually looks pretty nice inside this is through copilot. Okay, that's the agent Hebart block view.

[0:57] Emilio Oldenziel: For local nice reports but I've also used this, For projects where we work with multiple people, so we're with the team.

[1:05] Speaker 2: I was just thinking how it probably looks the same place.

[1:09] Emilio Oldenziel: And cost breakdown and everything.

[1:11] Speaker 2: Is that Airflow? Airflow here.

[1:16] Emilio Oldenziel: Yeah, you can just run this locally in Python, but here's the demo, and then it looks a lot fancier because they have better data.

[1:27] Emilio Oldenziel: But What's very nice about this so your datasets, For evaluation and evaluation runs, those are your judges. You can manage them, also your prompts. And it now also has a gateway since last version. It's not really good because it's very bare bones, but to have something at least to try out locally, it's quite nice. Like you copied the UI? Well, I said MLflow was already used MLflow since 2019 because I used.

[2:00] Emilio Oldenziel: Very well known with this part of the old version of MLflow, like the traditional how to train the model, machine learning and MLflow. And since two years ago, they started agenticly developing MLflow further and also the general part of it. But most machine learning engineers that I know they use MLflow because they're already very accustomed. Of course, it's industry standards maintained by Databricks. So everything where we needed a platform very, Quickly, but we couldn't decide on a venue yet. We just said okay, We wrote out an MLflow locally uh in a Docker container. And then we use that while we are prototyping.

[2:41] Speaker 2: Is is is this a demo or demo version? Yeah,

[2:45] Emilio Oldenziel: This is the demo version. So I just if you have a Python environment, you pip install mlflow run mlflow demo, you'll get this demo.

[2:54] Speaker 2: Yeah and it looks in your local.

[2:56] Emilio Oldenziel: It's all local. This is all local. This is a Python Flask, Yeah, running locally. But it's to get a feeling of okay, what is an gateway, what are judges, uh what is tracing to get a feeling with it. It's very nice. Locally? Yeah you can do this 100% locally. So, this is my personal preference, but um yeah, it maybe feels nice to see to get a feeling with it.

[3:29] Ron Koppelaar: And, you can do some kind of regression test if you're actually looking for that. So you can create a cool tool.

[3:39] Emilio Oldenziel: You can even if you create a judge, You can, for example, do a run over all the traits last week or some sets. Then you can really build stuff to building quality. For example, when you're building products, and you have some service for example, and the model is updated, do want to know that the quality is still the same? All that to manage them in the platform like MLflow or Foundry or Ork AI. So, a guy two guys from Amsterdam that build a whole platform.

[4:12] Speaker 4: Yeah, they also have very nice cost tracing in Langfuse. Each tool call you can see what the cost is. Yeah, it's also ping API and everything. It's the same idea. Like there are another ten or twenty of these, Frameworks as well.

[4:27] Ron Koppelaar: LangSmith also has the gateway built in now. That was what I think was missing.

[4:34] Emilio Oldenziel: Yeah, everybody has a gateway now.

[4:36] Speaker 5: These gateways have security functionality, doesn't it?

[4:40] Emilio Oldenziel: Depends on the feature set. For example, Langchain Lab has a lot of security stuff, but also PII. That's also quite interesting because you have global routing now a lot. What OpenAI said is okay we are running out of GPUs so, Let's do global routing. Also, Copilot now is global routing, so you cannot you have to configure it to stay in the EU. But then what they did, and that's very sneaky is OpenAI introduced a privacy filter. It's open source, so that if you put this for example in your gateway, it will mask out all the PII personal information. Yeah and then it's not sensitive anymore so you can route globally. So they only released it because of that.

[5:28] Ron Koppelaar: One question, and this is mostly also regarding another case we just had in Unik. When you save all the traces in GitHub repository, is that in your GitHub repository? And if so, if you for instance decide to change job, How will C do the whole compliance work, making sure that you delete all.

[5:52] Emilio Oldenziel: The stuff that is related to your job? Same like the history of course that is locally now in VS Code. Safe in the same way. When, you do this as a control plane on, of course, the whole organizational level, you can log everything on organizational level and a broad environment. Of course, It should be closed off, because otherwise people can look at whatever traces you don't want that. You want to have statistics out of it, but then you can use that as control plane on an organizational level. And that's then also where you end up.

[6:26] Ron Koppelaar: A lot of people do this, and then there's the CTO just to lose their own GitHub. So stuff like that. And then for me, That's a compliance thing that I don't think our compliance department.

[6:36] Emilio Oldenziel: Is best is if you enable your engineers as well as possible, they will go with the easiest route, which is what you provide for them. If you make it hard, yeah, they will create shadow IT. Yeah. It always happens. It's not really a problem. That's why I'm quick into retrospectives and stuff or whatever to.

[7:01] Emilio Oldenziel: Um, we've looked at the canvas. We want to make a plan for tomorrow of what we want to discuss and make an agenda. So that we.

[7:12] Speaker 5: There is an agenda for tomorrow already.

[7:14] Emilio Oldenziel: Yeah, or at least tweak that in the sense of okay, In what detail do we want to discuss it based on what we've learned today? Because today we also had an agenda. Yeah. But what you want to. Take from that to tomorrow. Any other ideas, Kobo, that you wanted to discuss now?

[7:39] Kobbe van Daatselaar: Uh, well, I left when you started creating the Miro board, so I'm not actually sure how far you got. It's a mess. That's what I can see.

[7:54] Speaker 5: We only just got started with it and then we uh sandboxed it.

[8:00] Ron Koppelaar: And. One of the success criteria was also that there was something tangible that we bring out of here for this meeting. And what would that be? Is it, somebody sitting together, building a flow with the humans and an agent to see how that would work, or what could be the product?

[8:38] Kobbe van Daatselaar: So, Some kind of reference architecture, I think would be really nice.

[8:54] Speaker 5: How Would dare to suggest that we throw some of the MD files that I've got? Together with some of the MD files that Raymond have got, and we throw an agent at it and say, make a suggested architecture, reference architecture based on this stuff here. See what that does. For example, just to get the ball rolling, right? Something like that. I mean sitting here doing it. Now, ourselves is probably too much to ask you to do today tomorrow. But to take bits and pieces that how do you feel about that? Think about what your reaction is going to be because I think there's you know wiggle room.

[9:29] Speaker 5: You can even be a mermaid, Doctor.

[9:38] Raimond Stokkel: I don't have a file yet, But I can pump one out with the architecture as I have it now with a projection, how it should be, at least for the repo that my agent knows.

[9:52] Speaker 5: Actually, What we could do actually even better, because then I get out of this completely. You put together an MD file. Shift to us, right? I'm going to shift my MD files to him, and he's the one who's like got all the presentation skills here right now. Hello, yes, bro. You will have. I was pointing at you. And see if we can do something that way. At least to get it started, see what it might look like. And then this is then a what's the word here? An uh, an AI assisted suggestion of a potential architecture reference architecture based on where we have what we have right now. What do you think?

[10:28] Speaker 5: I'm motioning, I am motioning. What do you think?

[10:31] Emilio Oldenziel: For the software, different lifecycle at least.

[10:34] Speaker 5: No, yeah, yeah. Yeah for what we have right now. That's basically uses up the full software development lifecycle and mine covers a bit of a. What do you call it governance, right? And probably, yes, we will throw in a few of the other areas as well.

[10:48] Raimond Stokkel: But still I think uh, the lot of uh, the mail board was a mess, but not last one about the architecture. They were really. Smart, cool stuff in there. We should be the lowest one, you mean? Yes, yeah. And maybe but then maybe if we can do both, eh? Yeah.

[11:02] Emilio Oldenziel: That's actually uh I have some stuff already also uh on the shelf still on on that. I can take up that task because probably third time I'm doing that. So I can use some extra knowledge also.

[11:17] Raimond Stokkel: But then at least uh the the the endpoint security boundaries guardrails uh that, Part that we can do in the architecture, and I think some of that stuff is spoken there also. And it's really cool if they at least also start on the front.

[11:37] Ron Koppelaar: There's the ultimate goal also that we are going to share the same infrastructure.

[11:44] Speaker 5: Or excuse me, I mean he's the one who spoke out on that subject earlier, right? You or him?

[11:51] Speaker 4: Of course. Or do you say oh, the architecture is.

[11:55] Ron Koppelaar: Implementation can be set to parameters.

[11:59] Kobbe van Daatselaar: I think that's an optimization. I'd rather work out with something that we say, okay, we know how it's done. Do it like this, Give us this and this and this information or put in this information and then we can work with you and teach you how to embed AI in the full development lifecycle.

[12:22] Raimond Stokkel: Yes. Yes. But is it, Is it so? That's then still a playbook and not an actual finished.

[12:31] Kobbe van Daatselaar: Well, I think it's both. I think right, so if we work together to no after tomorrow.

[12:42] Speaker 5: Same page before.

[12:44] Ron Koppelaar: You said that I could we meant by the end of the week. Yeah,

[12:46] Kobbe van Daatselaar: Sure you did by the end of the week is fine.

[12:54] Speaker 5: Is it a reference architecture you want? Is that what you want? Well,

[13:01] Kobbe van Daatselaar: Basically, the first question is how do we implement this across the group, right? So that's one thing. So we have this traveling circus that we thought about. Basically, what you're doing in unique, right? So you have one team, then you get another team and then you get. basically it's something that spreads.

[13:21] Kobbe van Daatselaar: Right, so basically when you walk into a team or another entity of ZIC, right, we should say okay, here's documented what we will do. And now I will be here to assist you in building this stuff and make it work.

[13:34] Speaker 5: But, then we need to come to like an agreed reference architecture, and we need to try and do what you said earlier. And that actually start test getting that implemented. Yeah.

[13:47] Speaker 5: So, I still stick to my original suggestion. Unless anybody's got any better ideas, welcome. No problem with that. But just put together what we have right now with MDs and shit like that, and then just see what we can get out of it, and then build it from there.

[13:58] Kobbe van Daatselaar: At least something we can discuss in yeah.

[14:05] Speaker 2: I think there is a lot to learn about the harnesses Yeah, yeah Well.

[14:09] Speaker 5: I think it's good to bring everything together now Right? Yeah Try and see what.

[14:13] Raimond Stokkel: Yeah, Because I think it's really good to push through the way of working, and we can help with doing docs and indexing. But still, If the ones that even if it's a PO or a dev or a Q& A doesn't understand what the harness is doing with the information that you have in organization, then yeah, it's still a surprise what comes out of it. So I didn't think it's both. You can't just say okay here's the harness good luck. It's really good and leave it at that.

[14:39] Speaker 2: I'm still thinking that how can I apply the harness to what I have? Because I still think that what I have is actually great. Don't take it like that. It's more so that they could all control about it, and it's doing it the same way you feel comfortable. I feel very comfortable, But I also know for a fact that we are taking in way too much information, And i know what I can feel from the harness part is that it's trying to.

[15:11] Speaker 2: Give you the information you need, not everything. And we are taking a lot in. So that part I want to make work and yeah.

[15:23] Kobbe van Daatselaar: But then I agree with Andrew, right? So put the piece together, have some diagram that we can discuss and then try it out.

[15:30] Speaker 5: Yeah, We should do the harness thingy and then the product definition agent and maybe a key maker and refinement agent. And a few things, put them together and see where we go with that. But then it just draw the whole picture together. See what comes out.

[15:49] Emilio Oldenziel: Make up blueprints. Yeah, with some principles at least, but a few main principles. Don't put too much, put as little context as possible within your harness. Start there, A few basic principles,

[16:02] Speaker 5: You're already an exception; I'll be happy to get a diagram of it exactly Yes, agreed.

[16:16] Kobbe van Daatselaar: At Least we have one. At least we have one session today. I.

[16:21] Speaker 2: Think just sleep on it, right? But the idea about serving, just keep going with it. The idea about being able to control which model you're using in a certain context, it's extremely valuable because anyone from any team can pick the highest model. And then run everything on it, right? You want some degree of control.

[16:44] Ron Koppelaar: And I fully agree, but let's try to put everything together. I don't think the idea of sub- agents. I think the idea of a harness framework that can then then sub- agents can decide," I want to subscribe to this and this and this from this harness," then that would be the powerful combination here. Cool.

[17:07] Speaker 5: So how do we do that practically, Remo? Because I'm not sure if I can work an all nighter tonight. I've done.

[17:12] Raimond Stokkel: I'm asking Codex to. What? I'm asking Codex. I mean, uh, Claude code. Claude code is. Can.

[17:20] Speaker 2: You just say by by nine tomorrow could you please have this ready?

[17:25] Raimond Stokkel: No mistakes. Yeah. Validate.

[17:30] Speaker 2: Against this agent and this agent and this agent. Mail to me when you're ready. Tested.

[17:35] Speaker 5: Yes, but how do you feel about this? I've got three ones at the back here. How do you feel about this?

[17:40] Ron Koppelaar: So like dump a lot of empty files and descriptions into somewhere. I mean,

[17:46] Speaker 5: You have them all available anyway, right? All in the GitHub. I would go literally not too many, but go for those ones with the product keymaker, The product agents or retirement agents back in front- end agents, maybe some survey as a sort of like starting point. How about if we think about it? You know, minus three hundred of us, you are open for that. I have a definitely a well recognized block in that area. Drawing people on the device? No, all the time, all the diagram skills. Oh, and the funny thing is like.

[18:34] Speaker 5: Horrible because actually what I'm going to demonstrate tomorrow is, uh Cobo gave me your skill right for uh diagram your skill, PowerPoint presentations. I asked him for it one day because I knew I had a shortcoming on that one. So it's like, okay, let me go with that. And then I am going to demonstrate creating an agent for creating PowerPoints. And uh then I'm going to actually create a PowerPoint file. Oh, no, they're already. And it's going to look like shit. Going to tell you that right now so you can expect that tomorrow. It does all the thing, and it puts it all together from the skills there and everything. But the diagram, which is.

[19:04] Speaker 5: Presentation, but that's okay. We'll fix something. It's about the message, not the. I saw it the first time when I went, oh god! But I don't have time to fix it. So, I think he's done. No, I'm done.

[19:20] Ron Koppelaar: Oh yeah! But maybe you should have a sort of shared space where we. Yeah, exactly. Yeah,

[19:28] Speaker 5: We were just talking about that actually. So we need to figure out how to do that.

[19:34] Speaker 5: We already can start to use this. I'm going to create a team here in Miro here. Unless you want to take it, I don't care. Easy, we just create a team in Miro, put this all into that team and then just build on that.

[19:48] Kobbe van Daatselaar: I already have a team site, right? We can just.

[19:53] Speaker 5: Will we also join in? You mean that one you mean?

[19:56] Kobbe van Daatselaar: We have one set up for the international community. So probably not all of you are in there, but I can add you. And then we can just create a folder in the SharePoint side and whatever.

[20:08] Kobbe van Daatselaar: Probably Can link Miro to it.

[20:10] Speaker 5: Can we create a shared wiki somewhere somehow so we can all contribute? Speaking of that,

[20:16] Emilio Oldenziel: Of all doing this also in MD files, hypothetically natively as well.

[20:21] Kobbe van Daatselaar: I can set up a repo.

[20:24] Emilio Oldenziel: Is there a safe group?

[20:28] Kobbe van Daatselaar: We have an enterprise GitLab. Setup. okay. yeah,

[20:33] Emilio Oldenziel: Yeah, there will be that. instead of extra devops because then your mermaids can hear them correctly.

[20:40] Speaker 5: Will you give it a rest? No, I mean you do not encourage him anymore. I'm generating mermaid,

[20:46] Speaker 2: I'm actually creating.

[20:47] Raimond Stokkel: The You cannot invite any guest any kid any kid help user. But Fritz said that it might be difficult because there's also uh nothing so on. Yes, that so they need a GitHub account. Does it exist? I do not know.

[21:08] Emilio Oldenziel: There are people in the. That's what I thought.

[21:12] Raimond Stokkel: Yeah, I think you can do that. You mean you cannot get in? But.

[21:24] Ron Koppelaar: Isn't it just to create a new repo? I mean, we have GitHub accounts, all of us.

[21:33] Ron Koppelaar: Every company you create in the enterprise, they all have to be configured. Different organizations. I.

[21:40] Raimond Stokkel: Think it's the same policy.

[21:42] Ron Koppelaar: And then it doesn't work very well. The only way that it can work is that we invite them as a guest account to Zeek, then it can work. So did you see your car burning or no?

[22:02] Ron Koppelaar: Yeah, and GitHub is not the place.

[22:05] Speaker 4: Not the place. You can't do DevOps. Yeah,

[22:14] Ron Koppelaar: We'll see if we can get a week on it. De Olschot niet? Ja, Olschot is Antwai die dit dit dit altijd.

[22:24] Speaker 5: Butum, can I just invite you to our. What?

[22:30] Ron Koppelaar: Yeah, okay. We have a GitHub, but we don't have any repos in it.

[22:35] Speaker 5: I'm not sure what you're saying here. You said we have GitHub?

[22:38] Ron Koppelaar: Yeah, just create a new repo.

[22:39] Speaker 5: But you said the repo of GitHub is not an option, right? Yeah,

[22:43] Ron Koppelaar: It's an option, but in uh We talked about the Ziek groep uh organization. That one has policies that you need to have a. Ah! It's beginning to work out here too.

[22:54] Speaker 5: Butum We could create a new organization Do we have policies on it?

[23:02] Ron Koppelaar: And we cannot add their domain.

[23:06] Raimond Stokkel: Now, that sounds complicated. Yeah. You said that we should have an access, right? No,

[23:12] Ron Koppelaar: I. Do you want part of the secrets group? Ah. I see that.

[23:20] Emilio Oldenziel: Someone already created SDL C agents repo.

[23:27] Kobbe van Daatselaar: Yes, it's already done.

[23:28] Raimond Stokkel: So why are we all here for this? Two years ago.

[23:33] Kobbe van Daatselaar: That was two months ago, so it's ancient. Yeah, I think it was December or something like that.

[23:44] Speaker 5: So we have a plan?

[23:45] Ron Koppelaar: Or a decision? No, not really, no. Still need to find an encode. But.

[23:54] Kobbe van Daatselaar: Let me try to add you guys as guests. Probably should work.

[24:48] Speaker 4: And then we should create a new repo.

[25:56] Kobbe van Daatselaar: Can I have one of your GitHub handles?

[26:00] Ron Koppelaar: JHB. Okay. Did.

[26:09] Emilio Oldenziel: You create the agents, scales, structure and agents for SCORING? Yeah, I did. Hello. In in in what? In uh ERP CRM. Yeah,

[26:22] Raimond Stokkel: That's correct. That's a copy of ERP CRM. Copy? That's a bug fix build for copy. Yeah, take take medical copy.

[26:32] Kobbe van Daatselaar: You get an invite?

[26:34] Raimond Stokkel: No, I'm on the email of Claudio and I see the the new decision with with the conference from this.

[26:39] Speaker 4: Afternoon to go to Belgium and how to stop with this thing. Let's let's do that first then we can go on from there.

[27:16] Ron Koppelaar: You Must purchase at least one more seat.

[27:29] Speaker 4: Otherwise We just create a github folder in teams.

[27:36] Ron Koppelaar: It has version control.

[27:45] Speaker 4: You can replicate, create a project for them and do it together.

[27:51] Raimond Stokkel: EP CREA is also available. Yes,

[27:53] Ron Koppelaar: That's right. But it's not in CREA, so it's not the EP either. No,

[27:59] Raimond Stokkel: They made a copy of the Burfix book for Asia to test. Oh yes, yes, but there must still be some checking in.

[28:07] Ron Koppelaar: Here somewhere. In one row and then another row? They should be checked together.

[28:50] Speaker 4: Yeah, Marking. At least something.

[28:54] Kobbe van Daatselaar: Actually see. Yeah, I still see. Yeah. Okay, now I need three more. You get the handles.

[29:08] Speaker 2: Put it on the cat content.

[29:12] Raimond Stokkel: Oh yeah, that's the yeah, that's the big picture orchestrator. Yeah yeah So I said oh really? Sorry, you are okay. I thought there was about seeing it on the screen, but it's uh Do,

[29:22] Kobbe van Daatselaar: You know, Tonys and Ollis?

[29:24] Raimond Stokkel: Super.

[29:54] Speaker 2: O L Y unique.

[30:00] Speaker 4: Yeah, make it. We'll fix that.

[30:07] Speaker 8: Why? But I won't be wearing this one after tomorrow. Both of phase two, both of phase three. So programmatically make it all the yeah. Yeah. Yeah, but that's what you don't want. You're just why?

[30:19] Ron Koppelaar: Yeah then you have to code every agent again.

[30:24] Ron Koppelaar: Then you can then you have to. Where do you write? What is that?

[30:31] Kobbe van Daatselaar: Can you access it already or?

[30:38] Kobbe van Daatselaar: Zeg Groep and then zeg AI SDLc.

[30:42] Ron Koppelaar: Neen, no, that that that won't be fixed actually. Then you have to. ZAI SDLc, yeah.

[30:55] Ron Koppelaar: I think it's.

[31:10] Speaker 8: So good. It will be so much better if you just run the well. Depend what kind of model do you want to run?

[31:15] Ron Koppelaar: Uh, it's a set. It's all that for consists profile. Some is good at four.

[31:25] Raimond Stokkel: So, what it's the control space and I fill in what the intelligence says. But he forgot to give me for it. Explain. You are the founding father of this document, so you know where you're going with this code. Tell me here,

[31:45] Speaker 8: Literally the fourth row of the document is already a problem for This.

[31:52] Ron Koppelaar: User info.

[31:55] Raimond Stokkel: Yeah.

[32:24] Ron Koppelaar: No, in the GitHub, I said that series is in GitHub. And using DevOps. Actually, in Azure DevOps you can choose when you start creating pipelines. The first question is where is your repo? Is it GitHub or as you demo? By the way, I think that is now. We it is you have the at least for AL. You have AL Go, which works if you have just one app. If you have over sixty, might be a horrible if still resource.

[33:21] Ron Koppelaar: We are now at the point that Jenkins needs more iron. We have to remove. Yeah, But Jenkins itself is only the engine ;. It needs more iron because the agents lives outside of Jenkins, right? The Jenkins build agents. Actually, Jenkins in a Docker. Yeah, I didn't check the attention. Yeah, and then you can contain your runs to agents in the department. But it's not quite true anymore with limited bandwidth. But the agent and the host are basically. And it works well on your build like big node.

[34:21] Ron Koppelaar: All want to see Friday afternoon. But yeah, I think it's a bit more. For the fear budget. For research, yeah. But, we did. We had our build machines because, as you develop it yourself as the hosted agents, you have to work with Java and C sharp for Node. And all the default is full of all. But if if you go for AL.

[35:20] Ron Koppelaar: Finish organization now for I think three fifty euros.

[35:26] Speaker 2: We have two machines, uh both running with ninety six me gigabytes and the internet for that month. No, no, no, it's really expensive or really cheap. And on those machines we have around eight agents built agents running.

[35:49] Ron Koppelaar: Build agents. build agents. yeah, and those are created over there. they they run more or less isolated. yeah. and that works, Yeah, it's so what I'm trying to explain is like the uh your board, probably the uh around three hundred dollars a month, you could host.

[36:13] Kobbe van Daatselaar: The wiki and git. Is it also because we can build a wiki in the.

[36:19] Ron Koppelaar: Repo. And if you look at the A L, the repo. Yeah, I've never tried that. So we need a shop? We.

[36:28] Speaker 5: Can do it later, if you like, or you can try on me if you.

[36:30] Kobbe van Daatselaar: Want to test our work. Else we'll justum yeah, it looks like just markdown uh what's possible for spinning up more containers? Yeah, yeah, yeah. Okay, that could work. Also requires a lot of memory so that's the thing.

[36:45] Ron Koppelaar: I'm not sure how easy it is to convert. It is 75, so the plan was to like the key mega.

[36:53] Speaker 5: I think all you need to do is get references to just your GitHub folder, right? Your GitHub folder locally, right? Then just list your files and say take these files, copy them, Group them together and put them in a separate folder, if not copy the files. Take all these files and then create a reference.

[37:13] Ron Koppelaar: I Think I'm understanding. But isn't it just to. So yeah. We can do that, but. Isolated to do a little bit more. Yeah, yeah. And then. Not if it can be done, but only do that for the keymaker builds. We can also check whether we're already interfering with the keymaker in defaults. Put it into the uh sub pages.

[37:47] Speaker 5: I'm not sure I would do that. Um sub pages you mean? Only the main clips and it builds. But you're missing the agent uh you're missing the actual agent itself right there, it's not there. Agent is in in the GitHub private uh and then deployed to GitHub folder.

[38:06] Ron Koppelaar: Yeah, Yeah. So, it's not the documentation about. It's more like perhaps you could do that.

[38:12] Speaker 5: Makes the processing a bit longer, right?

[38:15] Ron Koppelaar: Oh, and they're.

[38:20] Ron Koppelaar: Older Files. Yeah, yeah. So it's actually the empty file for the actually eating. Yeah.

[38:27] Speaker 5: And I would, I would actually just point it and say, take these files. So I would go for keymaker product refinement agent back in the front end developer agent stuff like a few of the key agents that we use every day. That just either points directly at a given folder or whatever. Okay. Sure thing. Yep.

[38:57] Ron Koppelaar: And we have a lot, a lot, a lot of programs. And that's just all the things from the field. So all projects will take. How much pipeline have you? I think I'll.

[39:16] Emilio Oldenziel: This is also an interesting one:" DevOps parts out to agentic engineering." Yes. To bring all.

[39:23] Ron Koppelaar: Let's stop here.

[39:26] Ron Koppelaar: The Jenkins box, yeah. The DevOps team. Which DevOps team?

[39:36] Speaker 2: There's only one.

[39:37] Emilio Oldenziel: I've been meeting with all the teams and I only have with one DevOps team. No,

[39:42] Ron Koppelaar: No, no, no. So I've. Yeah, there is one DevOps team. This is a DevOps thing, yeah. But that's ERP as well or.

[39:53] Emilio Oldenziel: Sorry operations? DevOps team that is pure about DevOps. And.

[40:00] Ron Koppelaar: There are some people that have nothing else. I think that's a another thing.

[40:22] Ron Koppelaar: Okay, there is now a total result. Yes, if you look at it from below, it's about a few hundred LiPo batteries. Each LiPo has its own ground fault. Mostly yes. That's the problem with building them, and then I still have the problem that the lines are open or not? But this is what we're going to build now. Image and we need to deploy it to the images. We need to create a deployment. Okay, that's indeed in DevOps, so you have a build pipeline that you build, the release pipeline that makes a release. And locally or if it's on the market.

[43:08] Ron Koppelaar: You can also very easily have different repos, so that you can assign those responsibilities to different teams. Who are responsible for a small piece. But also that deploying and updating your API specifications, there is just a standard workflow for it. And the GitHub Actions that were made for it were really simplistic. Without all the PowerShell tools and shit you can look at.

[44:09] Raimond Stokkel: I have a knowledge harness adoption checklist.

[46:22] Speaker 2: Can I push to master on this uh report?

[46:25] Kobbe van Daatselaar: Yep, it doesn't break anything in production, so you can.

[47:01] Speaker 5: I think.

[47:11] Kobbe van Daatselaar: In the top navigation just says wiki and.

[47:16] Speaker 5: You have to wait an hour because of the Wi- Fi, but.

[49:09] Raimond Stokkel: The order of who, because you're part of the team, product owners or you're part of the team. One may commit, but not the PO has to approve it. For example.

[49:24] Ron Koppelaar: So it starts as new, then it goes to approved, then committed by the team and then who works on it? Then it goes to in progress resolved. And then finally, the PO must also be back on done. That's the last step. And that's how we should work actually.

[50:12] Kobbe van Daatselaar: Hey Siri. This is scary. I called your name and then uh Siri popped up.

[50:25] Raimond Stokkel: That's the only model I'm not using it. Hey Siri.

[50:29] Kobbe van Daatselaar: No, you have to say hey Raymond, then it will turn on.

[50:33] Kobbe van Daatselaar: Yeah. So, Uh, Citrus in their input for these days, theyum they have. They are using a memory tool on top of MemPalace.

[50:54] Kobbe van Daatselaar: Built On top of MemPalace, With our own layer, hive mind context from brainstorm sessions, Specs and plans is mixed in the background on every developer's machine and stored centrally. Via MCP we can retrieve the full context of a specific ticket, spec plan and brainstorm months even or even years later. Yeah. Long term.

[51:18] Raimond Stokkel: I was on my palace uh last week. It's an option. Oh it's for me now yeah so why.

[51:26] Kobbe van Daatselaar: It was really bad. So, actually, so actually, trying to using that one.

[51:33] Raimond Stokkel: Oh yeah, that was a beep. It's a yeah, it was a bit of a hype. I know that the idea is still the current harness is based on the idea, but just doing it yourself without the weirdness. Yeah.

[52:37] Kobbe van Daatselaar: Yeah, I think that's a.

[52:42] Ron Koppelaar: Good point.

[52:58] Kobbe van Daatselaar: Until We put limits on it, then he will care.

[53:26] Speaker 8: They haven't looked at it yet because they don't have the time themselves, but I can do that. No AI problem. They're not using AI in the rest of the organization? Almost not. We need to do something about that. Do you mean like what I see myself? That's okay, maybe, but I don't know if we should use it for tickets. That would be better anyway.

[54:11] Ron Koppelaar: Okay, So you put it in the repo.

[54:29] Emilio Oldenziel: You do that once and like yeah. So now the question is, do I do SSH keychain or I ask the agent to do SSH.

[54:38] Ron Koppelaar: Keychain or I.

[54:39] Emilio Oldenziel: Will do the First.

[55:00] Speaker 2: Okay. Yeah, but the whole point that you share your SSH key with them. Mr. Tool. Yeah, forgive me. I guess it's still HTTPS. It can impersonate itself. Probably, They were okay for him to see it and contact me in project, and he said.

[55:53] Raimond Stokkel: For the harness, there is however based on the harness out is still on on the laptop. So, we need a couple of iterations to make it cloud ready or nice start.

[56:04] Kobbe van Daatselaar: Okay, because I think everybody's getting to start start getting tired after a long day. So it's I think it's good to wrap up. Um so for tomorrow, We will start with the agent's governance framework. And then the second part of the morning, we will discuss the LLM tooling costs, those kind of things. But, let's see if that makes sense or we should spend some more time on the architecture. We can decide tomorrow because I can imagine that once we start discovering governance, that we will go back to a lot of topics we discussed today.

[56:51] Kobbe van Daatselaar: So let's see. Otherwise, Tony and I will defend the cost for a couple more weeks. Is it a very big problem? Not per se, But let's say that the budgets were already before we decided to go full on into AI. First.

[57:18] Ron Koppelaar: But it would be nice to like come up with a plan with. A couple of people actually have a look at how to set up. Especially, we're looking for in kind of cover to be able to use a local LLM and not local on my laptop because uh, like local on like on a farm. So you offer anyone with experience, yeah, exactly. To get the pre- tokens first.

[57:43] Speaker 2: Yeah, Wherever it takes a lot of tokens to get uh I guess, product definition where it moves a lot of.

[57:51] Kobbe van Daatselaar: I Did some experiments with hosted LLMs in AI Foundry, so at least you can use cheaper models.

[57:59] Raimond Stokkel: I did it with your DeepSeek model,

[58:01] Kobbe van Daatselaar: I guess that's called. Yeah, that works pretty good, right?

[58:03] Raimond Stokkel: Yeah, the context window was a bit low but it can work occasionally. Have you invited.

[58:10] Speaker 5: Everybody here that needs to be in this international community meeting? Yes. Did you get that invite?

[58:16] Kobbe van Daatselaar: To the team side I did, yeah.

[58:18] Speaker 5: Just posted a chat message in there, saying weum the wiki is created. So you can just uh put the link to it.

[58:29] Kobbe van Daatselaar: Okay. And then tomorrow, after lunch, we will spend some time on the way of working and the metrics development manager will join. So we have two hours for that. And then uh, last couple of hours, we can spend wrapping it up and uh, making some concrete actions for next steps.

[58:51] Kobbe van Daatselaar: Any last thoughts, words for today?

[58:55] Ron Koppelaar: Oh yeah. I thought you said" I over shared," so I was confused after your whole day. That they had your name wrong.

[59:02] Kobbe van Daatselaar: Anything for now?

[59:08] Raimond Stokkel: No, that's a bit different than what I'm going to share. They're people expect.

[59:11] Kobbe van Daatselaar: Yeah. But.

[59:13] Raimond Stokkel: They already saw my name.

[59:16] Kobbe van Daatselaar: Okay, and they prepare.

[59:21] Kobbe van Daatselaar: Okay. Thanks a lot for today.
