---
title: "2026-06-09 12:46 — Agentic development - way of working & metrics"
date: 2026-06-09
time: "12:46"
duration_min: 63
plaud_id: b8f5956e44201a11c4995a880f74cb09
source: plaud
---

# 2026-06-09 12:46 — Agentic development - way of working & metrics

- **Datum:** 2026-06-09 12:46
- **Duur:** 63 min

## Transcript

[0:00] Speaker 1: Certain datasets, so we've improved on duplication. Sometimes people have done a lot of stuff and they actually come out worse. So that's of course something to reduce them. Yeah, I don't yeah in that regard there's nothing magic in this.

[0:27] Speaker 1: As I said, normally we are 1. 5 below what they expect us to do in productivity per and it measures in people years, people months, people days if there's not much in there. And one of the first stuff that the architects did was this ticket system. And there's a front end and a back end for this. First of all, what it's doing Is actually of really really high quality. Even though it's the graph here from maintainability over a period of time, it goes up and down, it's still above four point seven, so it's really stable. But, we can also do this volume effort where it looks at what has been produced, how many people-month worth of effort.

[1:26] Speaker 1: Is actually in this repository. And then you can see from May first until May nineteenth, when Jesper had something else to do, He managed to produce five people, months worth of work and have a day job on the side. So, this was This this a way to track and see that it actually has a huge impact. Um And or this not Jesper, this Ole. But Jesper would show the same, just more. So I'm sure he would like me to also show what he's been doing. And you don't get the front end disease, right? There's no sense in saying that. What I wanted to show was also this one, because this one was actually really interesting. As you can see when you started out, not much.

[2:24] Speaker 1: Happened the first few days, and then all of a sudden code maintainability dropped dramatically. One could argue that since this is now AI who's maintaining it, who gives a shit, right? But I still believe in difficult, maintainability will also create more or require more tokens to to get to a good result. I don't know if that's true, but I will keep saying it until somebody tells me it's not true. Sounds like it might be yeah. Then, All that came to Jesper and said," Yeah, I mean, is shit minus five." And Jesper said," Yeah." And I told Jesper," Don't do anything about it," but that didn't work. So Jesper actually started thinking what can we actually do. And SQL has an MCP server behind this. So yeah, you better tell yourself Jesper.

[3:10] Speaker 2: Yeah, It was simply just to part of the prompt when you create a PR before you create the PR. Just use this SQL skill and can say. Have a look at the different metrics, say actually, and try to fix it. Just like SonarCloud has thislinter also. But of course, It's just in the end is just a review of the changes to make sure that cycle I agree. And then you can see the result of this one.

[3:37] Raimond Stokkel: It is nice to lean on some magic well that we know it's right because it's industry wide used, but exactly it's nice to lean on.

[3:44] Speaker 1: Yeah and then of course also at during the same period he managed to, To put in six man months of work in there.

[3:53] Speaker 2: So so now it's actually part of the PR review agent, so it will actually do this every time. And that's how we improve the agents while we're actually doing development right now.

[4:04] Speaker 1: Yeah. Is it based on lines of code mostly? No, no, it's based on lines of code complexity and what effort also? Effort effort is all that. It's based on not lines of code. Lines of code there's a fucked up thing behind this, Um, because I as I said, we were slower than what they pointed us we should be. So I thought that something must be wrong, right? If you can't prove it, then fight it. Um and uh and they also they opened up quite a bit on what's going on behind scenes. It's quite complex. It's also with with the complexity of each section, how much is supposed to be auto- generated when you have the functions in there. What could AI just do for you as auto- complete, and all that stuff is also taken into account.

[4:51] Speaker 1: And also the tool. That's what Maine is using actually with a third party company, actually Zirk company, that is doing the technical investigation. Yeah.

[5:05] Kobbe van Daatselaar: The same companies, Software Improvement Group.

[5:07] Speaker 1: Yeah. Software Improvement Group, that's it.

[5:11] Kobbe van Daatselaar: So I actually have slides from operations from 2023.

[5:20] Kobbe van Daatselaar: For now, I'll only share that. I only share it at my room.

[5:27] Kobbe van Daatselaar: There's Room for improvement. One thing I found interesting, I was just looking at it. Now you can do a guessing game, right? How many person years of technical debt you think is in the product? According to.

[5:42] Raimond Stokkel: Years or centuries?

[5:44] Kobbe van Daatselaar: No, it's years.

[5:45] Raimond Stokkel: At least 100 years then.

[5:48] Kobbe van Daatselaar: Well, I can what I can say. The code volume is one hundred and thirty six person years. It's the volume of the code.

[5:56] Speaker 5: One hundred and thirty six person years. Operations.

[6:11] Kobbe van Daatselaar: Now This is the total code volume.

[6:16] Kobbe van Daatselaar: Yeah, That's the second thing.

[6:17] Speaker 5: Okay, I thought the hundred thirty six was.

[6:21] Kobbe van Daatselaar: That's what they say. What it's how many time you would need to reproduce it, right? That's basically what they say.

[6:28] Speaker 5: Person years.

[6:31] Kobbe van Daatselaar: Well, you've been working for five years with the eighty developers on a new product, right?

[6:36] Speaker 1: Yeah, and every time we cross first of January or first of July, I look at this and say" fuck." So first of January we went, From three hundred two hundred and twenty nine to one hundred and thirty six. That, and I said that that that absolutely crazy. In general, across the business, speed doubled. You know,

[7:09] Kobbe van Daatselaar: Twenty twenty three. Okay, but I so it's roughly it's one third. So forty one point five years of.

[7:16] Raimond Stokkel: Technical depth.

[7:46] Speaker 1: It was 95 man years, I think. And it was 41 man years worth of technical depth in those two combined. There.

[8:02] Kobbe van Daatselaar: Was a reason to start something new.

[8:03] Speaker 1: Exactly. The only thing is that we got a report like a year ago, someone asked me, we get a report from six or they come out and they had. How to earn money doing a presentation on where are we at now, what should we focus on and stuff like that. Came out saying, yeah, you're starting to your technical depth is starting to increase. You're starting to slide a bit. And, we did a sprint worth of like really focused getting rid of all the the stuff that they that they really pointed out. And we went like yeah across the.

[8:44] Speaker 1: Basically nothing really important.

[9:15] Raimond Stokkel: Yeah, We had the same bit of pages in the reports. In the reports, they all follow the same structure, but that's that's from MS, you know.

[9:24] Speaker 1: Yeah, but we've we've really come to enjoy using this. There is different ways that we can set this up so that there is a somewhere. I can see that there is a. Team thing in here, so where they can. No, I don't know where that is. They set up objective teams, and they are able to do that from quarter to quarter. They haven't really changed it for a while, and they set up rules for themselves, and you can see nobody applies to their own rules. But. It's also some of them are like they want to achieve that. I want to be at four point five.

[10:14] Speaker 1: You won't be if you unless you really, really, really spend a lot of money doing that. Is it linked to the CI/ CD pipelines? Yeah. Are there also gates defined so you can. That's some of the stuff we do.

[10:29] Speaker 2: When it's deployed to the staging environment, it's uploaded the pull request changes.

[10:34] Emilio Oldenziel: Or, is there actually a gate for if you don't pass in targets or thresholds or whatever, then the deployment or the build is.

[10:43] Speaker 5: Actually, The real gate is just before it's deployed to production. So actually, it's been through all the testing.

[10:49] Speaker 1: It's been all through all the testing and staging, but it's just okay now we're going to deploy to production. So first security then to production. That's our approach. Okay, this is just reporting is not let's say.

[11:00] Speaker 5: This is slightly different right? This is the targets that we set ourselves at various levels,- team level etcetera. And if you don't follow through on that team level.

[11:12] Speaker 1: Thirty, How complex is it to set it up? I mean, it's platform. I would say it's really easy, but Jasper is the right one to ask because he's the one who's doing.

[11:20] Speaker 2: It is like a one- line line of task in the pipeline. Remember, I said it's just a pull request. So yeah, yeah, I'm talking about our side.

[11:30] Speaker 5: Yeah There's also the file that we upload as well, right? There's a whole file configuration.

[11:35] Speaker 2: It says pretty easy to integrate. It is easy Yeah yeah.

[11:38] Speaker 1: And then I also, For example, we have some projects which are actually fully generated. It generates some code on a multi-level. It produces a lot of code, and actually those kind of folders, repos you want to get out of it. You, just you provide them with a list of exceptions, and what kind of files should not include and stuff like that. So that is something you set up with them because they do huge numbers. Exactly.

[12:10] Speaker 1: That's also what they asked us in the beginning.

[12:14] Raimond Stokkel: Realize to it's probably not cheap, but to have this as a body that's looking with you, okay? Are you still okay? Are you going the right way? Aren't you going flying off the handle with using exactly because you're going so fast.

[12:27] Speaker 1: Yeah. And, that is something you do with them figure out, what is it actually you want to measure on. And as I said, I had a chat with Eddie. And he's willing to set up a trial.

[12:49] Emilio Oldenziel: This can be, of course, used as a first metric for quarter, for example. And, then, especially with the development managers who are here also because we can look at these metrics and see if we see any movements and that we think okay, that represents the real situation of the adoption. But if there isn't, we can also look at okay, what do people say? And this is one of the objectives, right? So they think about okay, how can you measure the outcome of what you're implementing? How, can we make it quantifiable? And then see if the platform is enough or that we need to make something custom. But not make something custom from the start.

[13:31] Speaker 1: I think that also ties into they. This is really.

[13:38] Speaker 1: They have no idea what they're doing. A sales speed. We are accustomed to spend their in law. They just got it's recorded, it's from a surveyor. They just introduced this AI code governance thing.

[13:58] Speaker 2: It's a beta, right?

[13:59] Speaker 1: It's a beta and it should have been in beta longer. When they look at the repositories that the guys are doing completely hands off, you're like at thirty percent, forty percent.

[14:08] Speaker 2: I know that one of them I didn't touch any line of code. And it's like yeah, thirty five but yeah.

[14:14] Speaker 1: And we have too much instructions.

[14:17] Speaker 2: No no yeah but it's not counting instructions.

[14:19] Speaker 1: It'sum. It's guessing. Yeah it really doesn't make sense. Do.

[14:31] Speaker 2: You have access to data though?

[14:36] Speaker 1: Yeah, You got enough input. Yeah,

[14:40] Speaker 5: I think enough for the moment. Well,

[14:42] Kobbe van Daatselaar: We've learned you need at least one night to process stuff, so maybe we can talk about tomorrow.

[15:03] Speaker 1: Yeah, you burned it. That's all. No, I don't think so. Yeah, that's what I'm saying. No, nothing from me. So the thing is that. Yeah, yeah, yeah. Yeah,

[15:15] Emilio Oldenziel: He has.

[15:15] Speaker 7: So what do you want to do? For Facebook? For Facebook? Uh. One click to get the list? Yes. More than one minute?

[15:25] Speaker 8: Yes. Um. Did you have a look at it already? Did you not use it.

[15:34] Speaker 5: During the initial discussions in June?

[15:41] Speaker 1: I mean, we decided that we would keep it for the first year. I think May decided that we would keep it for the first year as always. This earn- out period that they call them in the loan period, they wanted to make sure that we weren't speeding up, but then we kind of.

[16:04] Speaker 1: And Then we did a three year deal. I believe we managed to get a good, otherwise we wouldn't have said yes at that point. We managed to get a good project for them that didn't become the conference for period. But now after the merger, he also wants you guys on board and we have Sonar Cloud, right?

[16:25] Speaker 2: That's all up to Sonar Cloud.

[16:30] Speaker 8: I was looking into the effort part. That is, I think, super interesting. Yeah, it determines a little bit how they do the effort. But yeah, that's important.

[16:42] Speaker 1: I only use it for the trigger.

[16:44] Speaker 5: Yeah, That's important to know how many users we have in a year or whatever it.

[16:52] Speaker 8: Costs otherwise to get them. These insights, if you're going to do something like that in index at all. It gives just estimates about overall code and new code. Yeah, but then we have three days of error depth here.

[17:09] Speaker 1: What I really like is the churn part when we actually set out to fix something. Did we actually fix something? That part is really good.

[17:29] Speaker 1: And when we told him we couldn't restructure his team members code, he started doing it in the evening. And every time he touched something, it came up with different scores. So that was a good thing. He got me quickly getting started.

[18:01] Kobbe van Daatselaar: Okay, we're going to the last part. Yeah. Um. The main thing that worries me now is that we shared a lot of ideas, and we have some concrete actions, but if we leave the room today, that we will end up with two different ways of working, two different harnesses, two different everything. Right? So I think I want to discuss some kind of. Com bined governance structure that we can implement to make sure that we are not only learning across Sich and Unique and later on across the entire group, but also producing stuff that we govern centrally. Does it make sense?

[18:51] Emilio Oldenziel: I think the key is in Michael Wilson's slides on the couple of architecture that we do it. Combined, so it is something we have produced combined. Because if you don't do it combined, some things also think about the pods, for example that we made. Which pods? The pods of that in the end, for example if the platform needs to get created, But all the pods for all the infrastructure or all the tooling they should be across company. Because it will be the same. It's not they have to be aligned to be same, or it has to be same. Agreed.

[19:27] Kobbe van Daatselaar: You want to end up with something that you say, okay, we have the entire harness set up, but you need to add this, This and this piece of information for a specific product and then you can work like it. Right?

[19:35] Emilio Oldenziel: Yeah. For example, The gateway, how we do the memory, how we do the governance that is just one of each. And it's across unique in Zeg. It's not that we kind of set same principles and then do it on our own. So we do it directly for both companies at the same time. We're just doing it. It's a bit more complex because I don't know what you need, for example. But making a team that has the combination, I think that's the only.

[20:06] Speaker 1: It's some kind of high- level governance actually.

[20:09] Emilio Oldenziel: Yes. By embedding it in the doing. Not only by on paper. So.

[20:16] Speaker 1: The advantage is that you're only nine days behind on your meeting.

[20:23] Kobbe van Daatselaar: Maximum Of two months, right? Yeah.

[20:25] Emilio Oldenziel: Also, with it's funny with Andrew, our boss Andrew. We had two practices at the company and they were always trying to align, trying to align. And yes, The decision he made back then is we're going to merge, and only then it started to work. So I think that would be a good conclusion here also just do it together. It will be a bit more difficult. But then at least there's it's the same team for all the things that we can do across the companies.

[20:53] Kobbe van Daatselaar: And I think the devil is in the details, right? So saying we're going to do it today like this doesn't make sense. These.

[21:05] Speaker 8: Are our candy men.

[21:14] Kobbe van Daatselaar: I'll do things that are on the top of my head. I think making sure Andrew, Wonen, and Emilio together. Form a group with a mandate to make sure that we build something that's generic across the group. And secondly, start to think about because I'm not saying it we should, can we work together and exchange resources? Because my experience integration only happens when you start working together.

[21:50] Kobbe van Daatselaar: Otherwise it's just knowledge sharing. And I don't know if that's feasible or not, because the first thing you said, I need someone who knows Business Central, which I understand. Right?

[22:04] Raimond Stokkel: As a development group, yes. But still, we are starting with the duo project, and that will also be the first proof of concept of that process. But I'm still missing a lot of stuff, which I did see in your meetings. So I need to align on maybe also an agent creator, but you had a lot of stuff in there that I'm still missing. So there for sure I want to align. Maybe not a generation agent, but at least you've got certain guardrails, you've got certain policies and things in their structures that yeah, I really want to see if I can either update it in the agents that we use or update our harness with it. And then.

[22:48] Raimond Stokkel: I test it again. And then we come back to together to share some of the results and sort of iterative. But let's basically look into the details.

[22:56] Speaker 1: Of the agents. Yes. And understand what is.

[23:00] Speaker 2: But it's more to be inspired by the concept, right? Correct. I don't think you can use it like one- to- one. No, no, no, no, that's not my point at all. Yeah yeah, yeah, but it's just to inform I think it would be really, really hard to just reuse it one- to- one. Because it's a different tech stack, But everyone different guidelines and.

[23:18] Raimond Stokkel: Have the principles that you found that are working very well. Then I want to somehow yeah,

[23:25] Speaker 2: I think actually we should go for both. Quite frankly, We should work towards a generic approach, which can be applied across the organization and then figure out how we can make that generic approach adaptable, so that when we get to different tech stack, etc. we can then.

[23:44] Speaker 5: Still use the generic approach, but adapt the individual specializations at a slightly lower level. And I can't I agree with you if you, if you meaning, we can't use the keymaker, for example. Yes, it is. I mean, example definitely not. But the concept and the principles, maybe that can eventually be evolved as what I was saying to you earlier, right? Some things can be used now and then we will try or try and we will work together on those now like harmonics, for example, with plugable bits whatever for the text app. There's things going on in parallel that we will then slowly know that we need to bring closer and closer together. So for example, if we say that something like the keymaker itself is used by both organizations, Then how do we evolve that so that it moves closer to the middle and then can be plugged into the rest of the organization? Also? So I think we need to have a little bit of a combination of parallel tracks here working on common things, specific things, merging things.

[24:40] Speaker 7: I think there's also just some concrete things that I need starting quarter three, which is a harness for customer. So I think that's a clear action. No, so I think so that's one. The. Second, one is we need the monitoring. So we can see the trends hopefully at the end of the quarter. So we can feel that it's uh that it's working. In secret?

[25:00] Speaker 5: What do you mean in secret?

[25:02] Speaker 7: Yeah, Or something similar or whatever. Just just so we can prove that what we're doing is working. Uh, The third one is at least for the PO side of things is that we need like a standard way of creating PRDs basically. Or tickets. Yeah, tickets. Because, that is something that well, if if we figure out how that works, then we then I can give to the rest of the product owners, and we can do that part. And time just time for everything.

[25:36] Speaker 5: But, what I what we talked about just in the coffee break. There was that uh, maybe we can get you a version of the product definition agent. Yeah. You can use as a starting point, because that's the output of the camp side and uh how that works, but I don't know how you feel about that.

[25:49] Speaker 7: I mean it's it's good but of course I already have my own. Yeah So, the the question for me. Oh, that's the thing that I was missing. The for me is like everything that we talked about, I already have a version of it. Like I literally, i can spin up five pro like programmer agents right now and start building on CRM. He doesn't want that, but technically I could do that already. I have the whole thing. But what I need is from top down, this is the way to do it, and then I can probably adapt or like give some feedback. So I'm missing the top- down part.

[26:17] Speaker 8: But but i i would like ultimately should we focus on the non- technical stuff? Well, That's what. So you have a very different. Uh.

[26:28] Speaker 7: Let's just focus on the PRD or the ticket part. That's all that's all i need so so if, If I get the governance stuff, if I get the. That's all.

[26:38] Speaker 8: If we look at the FITS and the keys for the QV, they don't mention that part before program. So do you really need.

[26:50] Speaker 7: Well, It depends on if you count a team or a pod with a product owner or not.

[26:56] Kobbe van Daatselaar: With a product owner. Yeah.

[26:58] Speaker 7: So, so if it is with the product owner, Then I also need the tools to make sure that the engineers can do.

[27:03] Speaker 8: Their agenda work. Or you can do this.

[27:06] Speaker 5: And, if if if the product definition is going to be used as input to the development agents, Then it needs to be uh structured in a way that they.

[27:17] Speaker 7: They have to. Yeah, definitely. So I literally need it in like three weeks. That's a very concrete thing. Like an engineer your.

[27:25] Speaker 5: Your product definition agent like, You have now already does it produce AI consumable outputs? Yeah. Yes.

[27:32] Speaker 8: Just keep going. It does not produce human consumable outputs, so. He is not human,

[27:38] Speaker 1: That's what he's saying, yeah. But does it consume agent readable outputs without a developer, tweaking it all the time? Can a developer look at it and say, okay, leave it for now, then I'll come back and I get exactly what I want?

[27:55] Speaker 7: Um well. Yeah. We have a discussion that like, and I think that's good. There's a huge separation of domains. So my agent does not at this moment look at the code. So it's just talking to me, Figuring out what like what is it, that's the thing that the harness hopefully solves, like a better understanding of the domain. Right now I need to keep feeding it information and repeating it because it forgets in the next session. But it does not look at the code at all. And, it literally comes up with scenarios that at the end of the process that needs to be tested. And, then his agent picks it up, and he actually looks at the code with the agent and then figures it out.

[28:32] Speaker 8: And I think there is some value in that. Definitely, yeah, that agent never looks at code. Yeah, especially now.

[28:38] Speaker 5: I was going to ask the same question. I mean, What we have as a target right now is that we will have product definitions and as the code evolves. So the product definitions will evolve to match what's in the code. Yeah, so it won't actually ever, From a product definition perspective, ever look at the code? You will look at other product definitions. If I have another system that does another part of the finance world or whatever, I will look to that in the product definition, not in the code. So it's a clear separation of concerns in terms of.

[29:06] Speaker 8: They just find is that we don't have a product definition. Yeah, we have a product without a definition.

[29:13] Speaker 5: We I mean we are in same boat in some regards right? We we have only product definitions are evolving right now. We have not taken. Existing systems and reengine reverse engineered to product definition yet it will come soonish. Um but it's not there yet. So we are taking right now for example to test the process basically, we are taking new product definitions. Yeah finance finance is kind of empty. Even though we've got a lot of code. So, we add actually a new module to finance without the all the existing ones for now and over time, finance product definition will just grow with the existing code.

[29:48] Speaker 8: But it also it also brings you now to, Two sets, maybe two checks. I mean, it automatically checks your definition against the code and vice versa because you've set it. And I think there is some value in that.

[30:05] Speaker 5: Just correct you a little bit there. Oh, I want to correct myself maybe a little bit there. It will automatically check the code against the property definition. It doesn't do that yet but. Ah yeah, no,

[30:14] Speaker 1: That's the point The way we do it today is also I think very similar to what you do. So we have the PO agent that creates. Creates all the business stuff, all the business requirements, all the. there's both functional requirements, There are also some non-functional requirements because there are some things you say, okay, I want this to yeah, to be like this or to work together with this or whatever it is. But that's like one thing of it. Then, there is the refinement agent that kind of does the process where it adds all the technical stuff. So, that's when you decide on. Okay. So what what kind of APIs will this integrate with? What is the.

[30:51] Speaker 1: What is the contract between this and stuff like that? That goes on in the refinement, and refinement talk to the development agent. So they that one has all the knowledge about what is actually going on. And that refinement, I would encourage you to do together.

[31:05] Speaker 8: Yeah, yeah, I agree.

[31:06] Speaker 1: That that the first part you can do with software matter experts. If it's not just you, if you have consultants, you want to, okay. So get the customer really think of this or whatever. That's the first part. The next part is actually getting from that, Into stuff that goes into, as you do also for your case, into Jira as action items, work items, artifacts. And from there, it should be picked up. And just as you're done describing it, you should have it five minutes after. Yeah. In theory.

[31:38] Speaker 7: Yeah. And then that ticket goes to the team basically, and they, they can do their stuff with it. Yeah, that's the part of the demo.

[31:44] Speaker 1: They basically they should do any stuff with it. Once you agree, you set the requirement once you agree. You say continue. When you say continue, then all this stuff is done. Then getting that review agent at the end. Otherwise he will leave you and say, I need to go review one of them. He will probably do that anyway, but having that review agent at the end is really really important. It also needs to look at the product definition. So is it actually doing what we said? Going through some of the parameter stuff saying, did it do the test? Did it do whatever?

[32:18] Speaker 1: So in that way you have the full flow. So from when you're done describing stuff together and refining and saying this is done, then there is no coding task. That's the whole purpose of this.

[32:29] Speaker 8: Yeah, And I think there. We do align a little bit more than with the onus of Babel because we have to do some kind of refinement weeks upfront, if we want to build something with an API, not ourselves. You have to know.

[32:44] Speaker 1: That before you start coding. Yeah. And that would normally just be your task moving forward, saying," Guys, I need to fetch something from you. I want to integrate with whatever you have." So that will be.

[33:00] Speaker 8: And I think also this is already something we can align, right? That this, how do you work like going to be using an agent for this for that? And this. That is also where we can align already use the same product.

[33:15] Speaker 5: Definition. You mean agents for different purposes, you mean?

[33:17] Speaker 8: Yeah, yeah. I mean, you can also not agree on this part already yet. Soum I think,

[33:23] Speaker 1: Shouldn't you guys figure out how much can actually be done generically and what needs to be so that the three of you guys work? Which three of us? Yeah. But basically the way you explain it now with with with the agents and and and high level software development flow. Mm- hmm. Yeah, Also more or less aligned with the presentation I saw yesterday from Raymond. That's the other planning mode, called refinement planning mode or whatever you're in. That's that's the task for, well, the future developer. Yeah, exactly. And that's also I thought that I didn't see any conflict in that. No, no. There was no conflict in that at all. I just saw it was one guy doing the doing the.

[34:08] Speaker 1: The whole refinement part, right? So it's the bulk. Yeah, But then I understand that it's an it's a duo thing with the uh with the PO or foundation. Because I mean, smart. I don't think anybody in your in your the teams that are working with this can do it.

[34:21] Raimond Stokkel: No, yeah, that doesn't even matter. It's even for me alone; it's not smart to do it alone. Even if you know everything, I feel not okay for one person. Yeah,

[34:30] Speaker 8: No, I agree with that. I think that's why we also uh we added Michel because oh, no Michel is maybe even. Or maybe we have met them, you know, sometimes. But then when you think you are right, you still can be challenged by someone else. And that is some. And I guess especially in the open part. You can, but you should not. That has some value if you do that upfront because it makes. Yeah. If you find bugs upfront.

[35:06] Emilio Oldenziel: And it will go quite fast. Would say the whole refinement cycle,

[35:09] Speaker 1: If you just sit well with two of you and and your agent, yeah writing and and uh well inventing what what you need to build based on the specifications, then some kind of verification loop. And then yeah, you have to change all the specs out of it.

[35:27] Speaker 8: And we go to the next. Yeah I agree. So the only part are dependencies, usually pretty difficult. Yeah, we have a lot of dependencies, but you already said, yeah. There are a lot of tickets or few tickets that don't have. Yeah,

[35:43] Speaker 1: I think the mindset from there, If I don't think all that Jesper had everything working by magic when you left it and came back to it. But when there is issues, don't go around the issue and just I'll just fix it this time. No stop making sure that's not happening again. And then keeping that constant improvement loop, that is the trick. Of course, we'll take some time at the beginning, but yeah,

[36:09] Speaker 7: But that's also for me. That's also part of the fun, like figuring out how to make it more efficient. That's the coder in me that comes back up when this stuff happens. I think you were the only P O that has fun in that. But that's fine because then it's just for me, which is good. So so it's okay.

[36:39] Speaker 1: I hope we didn't screw up the OKR part.

[36:42] Speaker 7: Everything that was there, we already do. So for me it's like, oh, I can already check off all the boxes, except that like there's no unified way of working. That's the only thing that's missing for and uh metrics. That's probably also a big task.

[36:54] Speaker 8: Yeah. Yeah and it's a task we postponed on a little bit because of time. So yeah, We know we have to make the step to get rid of all the initiatives where every single developer creates something for the team.

[37:15] Speaker 5: It's Already happening. It's already happening, so we know. We are in probably the best.

[37:19] Speaker 8: Discussions with the IT group. Yeah, we lost them.

[37:28] Speaker 5: It's also about getting the rest on board as well, right? The longer you wait, the bigger framework you build yourself, the bigger a hammer you have to use to get them to use it, and that's just going to hurt.

[37:39] Speaker 7: But I think we're very privileged in the fact that I think both Michel and Chris are really inspiring the rest of the engineers to start using AI more. You can really see that they start to use it, and they see the value. And that's okay, inspiring or expiring? Uh, inspiring. But I'm forcing.

[37:56] Speaker 8: Yeah, who knows? Forcing. Yeah, no, but but I think you need. I mean there are teams with no.

[38:04] Speaker 8: Front runners, no people are inspired.

[38:07] Speaker 5: It's good. I mean, with no examples, there's nothing to inspire with, right? So I mean.

[38:11] Speaker 8: Yeah. It's a challenge. For developers that will be a really big task to align.

[38:19] Speaker 1: And I don't know how the culture fit works but at least in Denmark, I was surprised how honest they were.

[38:26] Speaker 5: Who? The developers over there? They're brutally honest. These two looked a little worried, right?

[38:33] Speaker 8: Yeah, I know that. No, no, no. There are people that will be have been in the end. It's not going to.

[38:46] Speaker 5: Be massive.

[38:51] Speaker 8: Difference. And they know. Uh, but yeah, I think, To make an action point is, I think, the harness of the port. We should promote to something that at least is the starting point for every team. And I think it needs some polishment. It's focused on Windows and maybe it does not even run on a Mac, I don't know. But that is the next step, I think. Make that an C R M one, right?

[39:32] Speaker 8: So share all your tooling, and I don't think we have to add something.

[39:36] Speaker 7: Can I clarify one question? Oh, can this harness also be used by my PO agent for example? Is that something that's in this scope or no? If you want. Yes, please. We have a longer evening.

[39:48] Speaker 1: Before deciding on that, shouldn't we let the three of you have a chat together first?

[39:53] Speaker 8: I think that yeah, that's true. Yeah,

[39:57] Kobbe van Daatselaar: Because we also need to align with what you guys have right. We need to get, We need to align it with what you guys have and come up with one way of working, at least a pathway towards one way.

[40:08] Speaker 5: I think what the three of us need to do. First of all, is to brainstorm, some high- level ideas and then start pulling in a few of the experts to see how we can actually make it work, right? And then if we feel that that works, then we have a go at implementing it.

[40:21] Emilio Oldenziel: Yeah, There's a lot of stuff already also in the transcripts from yesterday that we just need to fine- tune as well and assemble the roadmap.

[40:31] Speaker 5: So ideally, we would get a harness the one harness that you were asking for, Right, which can plug in his stuff in his case and his stuff in his case and our stuff in our case and lots of other ones. And of course, that harness then needs to grow like we also talked about yesterday. So it starts with the basics that apply for everybody, and then we grow this much in your case. And on top of that, specializations within your area more same with us also. So it'll be a growing up harness as you go deeper into the uh, Into the task at hand, actually, depending on where you're going, context where you're going. Exactly. That would be your target if you want something like that.

[41:09] Raimond Stokkel: And your knowledge should work if your agent starts with". I'm a BO working for X," and then your agent is active and it's asking the question, The knowledge should fetch the information directly based on your role in your product of the agent. And,

[41:25] Speaker 5: Maybe we can even make it work and I'm just brainstorming now, just for the sheer hell of it to make it work. Installed instructions in each individual user's profile, so together the harness and network together and they automatically find each other. The certificate gets presented there, but just brainstorming. I think so too. Create the Docker images.

[41:51] Speaker 8: Do you use Docker? They run on Kubernetes.

[41:54] Speaker 5: I'm learning this enterprise security architect; I don't get that low level of shit anymore.

[41:58] Speaker 2: Do you look?

[42:00] Speaker 8: Or just run it locally.

[42:02] Speaker 2: Cool, it's loading. Yeah, I'll do it.

[42:07] Speaker 8: It does not matter that much, but makes it easier. Have you seen the start of the firefighter? We should have a look.

[42:17] Speaker 2: No, that's good now actually. For what?

[42:24] Speaker 5: I'm looking at him now Should I look?

[42:38] Speaker 1: And then they started.

[42:44] Speaker 5: And none of those guys ever learned. When will they ever learn? Yeah, but they are familiar with how to handle that, right?

[42:59] Speaker 1: I just again have to conclude that we. Useful but I think it's okay for tomorrow.

[43:11] Kobbe van Daatselaar: I will write down the concrete actions, share them with you guys. Feels to me like we have a plan, to be honest.

[43:25] Emilio Oldenziel: Yeah. Mhm. An approach?

[43:29] Kobbe van Daatselaar: An approach. Which we can turn into which you guys will turn into a plan. That's great.

[43:38] Speaker 5: The concept of the plan. I think one word approach is good enough. We follow it through, we make an appointment.

[43:48] Speaker 8: Personally, I think uh uh, we should also be already be happy if people actually use AI more like, especially within safe. Yeah, the casual chats that they do with Copilot. I think they were also in the charts of Fritz, like 79 or 103. I think who are the missing ones? And then after 79, there are a lot of just chats.

[44:15] Speaker 7: I think it was also already said that like not like a very tiny amount are using the agentic things and most is just chatting.

[44:24] Speaker 1: That's why we went to how much code did it actually generate? How many lines of code per session?

[44:31] Raimond Stokkel: They're Using the agent, they're jumping in their plan that they have in their heads with Word document, probably with a link to another Word document. And then the result of the agent is shit. And then they say," Ah, it doesn't work." Yeah. Yeah. That's exactly what we. And they discard it.

[44:49] Speaker 1: We had some of those that wanted to prove that this doesn't work. They pointed at some weird old features and stuff like they weren't really described for this. Some of them weren't even ready, and they pointed at that said," Do it." And then I didn't work. Point point.

[45:14] Speaker 8: And it always changes. I mean, Six months ago, you could say, maybe you could build go to a website do this? And this? And this for me,: this username, this my password. I think all my world could. Uh, Google's are filled in with AI now. Yeah. And they all work on all websites. And I think plain.

[45:36] Speaker 7: Text password to open AI?

[45:39] Speaker 8: Yeah, of course. Yeah, we need it so we can read our own errors. So so In the end everybody is right, so you get five cents back from your. yeah. yeah. Open source everything like open code? One was helping the rest I didn't care. No come on, I was.

[46:00] Raimond Stokkel: Fed up with all the. I think four years ago, I won a t- shirt because I won the pool. But then I was, I think, the only one that was using AI by entering it in. I won it once when they filled it in manually.

[46:13] Speaker 1: It was the. I think the. European Cup when Denmark went one nineteen eighty two and nineteen eighty two, something like that long long time ago, and we didn't have AI then.

[46:26] Speaker 8: Last year after my.

[46:27] Speaker 1: That's How I assess people when they show up for a job interview. Were you born when we became European champions, or something? Were.

[46:34] Speaker 7: You born a champion or not? Yeah, exactly. I was worried.

[46:39] Speaker 5: I thought you were going to say, When did Denmark last win the whatever? I have no clue.

[46:45] Speaker 1: That was more recent than the Netherlands. It was also time for the Olympics.

[46:52] Kobbe van Daatselaar: Okay, this is how we started yesterday morning.

[46:57] Speaker 8: Finals, check. But on part one, I think we should continue this. Yeah. Usually these initiatives die with the day they stop.

[47:15] Kobbe van Daatselaar: Yeah, so that's actually a question I have, right? So, we have this international AI community with Chitra and Dozer and Akhilesh, who are now back home doing their own thing. And keep continuing doing that, which is I think fine. Right, um. I don't know if you guys looked at it, but they provided it with our input. I think it's good to look at it, But probably check some stuff we might be able to add to our way of working or harness or learn from them. So get some knowledge from that. But it was not.

[47:54] Kobbe van Daatselaar: I didn't see anything that we haven't discussed yet. And also,

[48:02] Speaker 1: There weren't anything that they said you need to cover this or take this into account.

[48:07] Kobbe van Daatselaar: So no, I think the majority just said to give us something that we can work with. Yeah, fair enough. Which is fine, But for instance, they did some shared memory citters had to implement something, at least you played with right?

[48:22] Raimond Stokkel: But yeah, Bit of a hype for the week, but it's not sustainable. But the idea that there's doing it and investigation and probably maybe find out okay. This may be not great, great, but they're thinking about it. That's that's yeah,

[48:36] Kobbe van Daatselaar: But I think also from getting the buy- in from the company rights, and that may be something you guys can think of. What are the topics to say okay we have ideas but maybe in fight, For the shared memory part and steer it in some direction that at least they're involved and that they're part of what we're building, right? I think. Yeah, I think that's important.

[48:57] Emilio Oldenziel: Also on gateway for example. Yeah,

[49:02] Raimond Stokkel: They can benefit day one from it without changing the way of working.

[49:06] Speaker 5: Have you already implemented the gateway? Is that right? Three times already. I mean for this company. For this company, yes. That's what I meant for this company, No, is that something that is actually in the planning or is that uh.

[49:19] Emilio Oldenziel: Well, it's on my list for the AI platform. It was also of course in the notes yesterday. So for the architecture we have to draw it in. But for example which vendor suits best like use Light LLM, the MLflow one. I don't know which suits best for our company.

[49:38] Speaker 5: It's fine, I just wanted to get a rough idea of where we were right now within all.

[49:43] Speaker 1: These things. Yeah, it could be that the next great tool is is coming out tomorrow, right? Yes. You know we can quickly transfer that.

[49:50] Speaker 5: Worst case is that we don't get locked in for something we don't want to end up keeping or something like that. Observability.

[49:59] Kobbe van Daatselaar: For software.

[50:08] Emilio Oldenziel: Development lifecycle. For our products, we also need a gateway for the clients because you need observability. The client's usage, for example, for the chat usage on our websites. We don't know. We log, but we don't have full observability.

[50:25] Kobbe van Daatselaar: Okay. So, at least I will send an update or make sure that they get an update on what we've done in the last two days. And what's the outcome, The next step and how we will involve them or invite them to be involved on certain topics.

[50:43] Kobbe van Daatselaar: Um, but you said the knowledge sharing that's how we started, Chris. Um, because probably this yeah How should we do the knowledge sharing? Basically, that's the question. It should continue in which form and who should be attached.

[51:01] Speaker 8: The bigger the island uh I always experience right so.

[51:08] Kobbe van Daatselaar: So I think we have the international.

[51:09] Speaker 8: We have one group already, right?

[51:10] Kobbe van Daatselaar: So we have a monthly knowledge sharing update session where everybody can give demos. So I would say everybody in this group working on something, make sure you give a demo to the community. Sorry?

[51:21] Emilio Oldenziel: You need to build a.

[51:25] Speaker 1: Community. Yeah,

[51:27] Kobbe van Daatselaar: So that's already there. Yeah, so we can use that. But it's once a month, right?

[51:32] Speaker 5: So The thing is like we are going to start.

[51:38] Speaker 5: We're going to start preparing a reference architecture, concrete reference architecture. We'll start with just three of us, But very, very fast, it's going to pull in him and all also because it needs to be implemented, It needs to be tested in line with what we currently are doing technically also. That's how I see it starting. And, then at some point in time, what comes out of there will go into the international community. And we will need to touch base.

[52:09] Speaker 5: Probably a little more regularly than once a month. Yeah, right. That's what I am saying. We get started with one meeting. And then it's maybe two or three more meetings. And then it's like maybe a week later aligned with the international community. So every month that kind of cycle kind of thing. I can't give you exact numbers, but it's like levels of detail, you see what I mean? High level, more detailed and then do general knowledge sharing type cycles.

[52:33] Speaker 1: I remember Amelia picked up on.

[52:38] Speaker 1: I think you're right.

[52:39] Speaker 5: Yeah. He's even got his hand up. Yeah. We could stay another four. Yeah.

[52:48] Speaker 5: Anyway, That was just a shooting from the hip type of thing about how we, because then the knowledge sharing will be on the on the shop floor basically with us here, right? And, whoever needs to be there when they're there are pulled in. And then on a monthly basis with the international directors.

[53:03] Kobbe van Daatselaar: Okay So, you will drive that, right? Yep, I think one thing we have to maybe you have to touch upon is have a one on one with Jonathan from Activinov because initially, he well he's very eager to be very much involved in this topic. So discuss it with him. Which group? Activinov, Lyon.

[53:28] Speaker 5: Lyon, which is then which product? Multiple. This was text stack.

[53:38] Speaker 5: The one we don't have yet. Yeah, But the one thing I'm not really sure is where to put you in this whole thing here and how we how we do that. You need to yeah, that's also good. Figure it out. I think you should be left out, But I'm not really sure where to fit you in terms of regular technical platform stuff.

[53:56] Speaker 8: So uh, maybe can share how you do the PID finish stuff? The end-.

[54:05] Speaker 7: To- end definition all along the products, Owner agent. Yeah, David's stuff.

[54:10] Speaker 5: And we can start connecting with each other on Teams, can't we? Yep. Just by finding him and then connecting on Teams, just in that right now. Yep. Okay, But then we just uh figure out maybe set up some chats or something to We'll talk about that later. Good.

[54:25] Kobbe van Daatselaar: Okay. So then point three is to work out with something tangible. I think the tangible stuff is that we have some very rough concepts.

[54:37] Speaker 5: And a group that. And a group is going to work on it. Yeah,

[54:40] Kobbe van Daatselaar: Exactly. Okay.

[54:42] Speaker 5: We have a lot of ingredients everywhere,

[54:44] Raimond Stokkel: They're scattered and maybe not in the correct place, but the results are already very good, you know, That message also I feel like if we keep in contact uh shortly, then it I think we will soon have something tangible. Uh, like to show as a result of this meeting.

[55:04] Kobbe van Daatselaar: But Maybe to align and to keep in sync, So probably you three will set up something on a regular basis to at least sync on what's going on.

[55:14] Speaker 5: Will do. I think, should we use the international chat for everything? Or should we kind of a new separate chat just for this group here? Or how what do you think?

[55:22] Kobbe van Daatselaar: You can do whatever you like.

[55:23] Speaker 5: Okay, I'll talk about that. I would step foot That's my feeling also Yeah, I think time asking questions because it's a lot of noise for the international, Chat, right? But, if it's just focusing what we're doing here as starting a lining and then slowly spread that out into the group. Yeah,

[55:39] Speaker 7: But it would be nice to have a singular singular group for that everyone can at least see that there is progress made, that you can chip in with announcements.

[55:48] Emilio Oldenziel: Yeah, Could seem as well,

[55:49] Speaker 7: Not not like having like full blown conversations in a single chat, but like giving the updates or you know.

[55:54] Speaker 5: But, that's where we would use the international one because they keep updating there right now. That's happening in the smaller one. That's how I see.

[56:05] Speaker 1: It. The international group is not that big, is it? No, it's not.

[56:10] Kobbe van Daatselaar: But if you throw everybody here two or three from Akifinov, two or three from Citrus, two or three from Dozer, so it's ten more people. And, we don't have. We didn't start with strict rules from who should be in it, right? So so probably a lot of people want to join also still.

[56:31] Speaker 5: It's hard to know. I don't also want to go for a model where we're excluding people as well, right? But that's also not healthy, is it? For like really tough callers from really tough. Okay. Yeah.

[56:45] Kobbe van Daatselaar: Did we miss out anything? And would we call it a success? Because.

[56:55] Emilio Oldenziel: Great stuff for sure. Yeah, I'm very pleased with it. It's a good approach and we've more in common than. Yeah, exactly.

[57:06] Speaker 8: Okay. And I still think it would be interesting to see how you work and how we work globally. Yeah. Like be an intern for a day.

[57:17] Kobbe van Daatselaar: That's what I mean with really start sharing resources, right? Yeah, I mean just go and work on some shit together. Yeah, not this group but also with people.

[57:31] Speaker 1: And there might be a project for it, also, right? Yeah. But do you build front end stuff? Angular. Angular. The new Angular.

[57:40] Speaker 2: Yeah, yeah, yeah. It's just the frontend routine language.

[57:43] Speaker 1: I asked Uwe, how we should reach or shift to React now? Yeah You're.

[57:49] Speaker 5: Not talking Angular JS are you?

[57:51] Speaker 1: No, no,

[57:52] Speaker 5: We are still at that Is that the one you said there were two That's. One of them is that it That's not Angular anymore.

[57:57] Speaker 8: No There are two. You can catch up with the same. I built software eight years ago.

[58:04] Speaker 1: We, just we got rid of it. The last we got rid of a year ago. Yeah, we still have internal tools all in V S.

[58:12] Speaker 5: We are as long as possible apart from the original systems, as long as possible, we are hanging on to single simple text stacks. There is nothing simple about it but is it not true?

[58:25] Speaker 1: L B Sweden's add on they have their new system, The one that they're shifting to is an.

[58:34] Speaker 9: I know one.

[58:36] Speaker 1: I just wish you had said," Yeah, no." They.

[58:44] Kobbe van Daatselaar: Really want to use stable products.

[58:46] Speaker 8: They injected the in the room, yeah.

[58:55] Speaker 1: But, the good thing is that the new system is standing on top of Java eight.

[59:01] Speaker 1: And the new version is Java twenty seven,

[59:03] Speaker 5: So you can kind of guess when this is from. Java eight. It reminds me of Jurassic Park and the dinosaurs. Yeah, I am worried about that deal though. API? It's not.

[59:18] Speaker 2: As net full list not not the list yet, but it's net eight right now. We're building them eight and nine actually cannot upgrade to latest NuGet packages and. NET Framework.

[59:32] Speaker 5: So we we simply have docklet and SQL server, RabbitMQ. Basic stuff. You've got to rabbit! We have decided.

[59:44] Kobbe van Daatselaar: Yeah. What's the discussion? RabbitMQ versus.

[59:47] Speaker 1: Everything else? Kafka versus RabbitMQ was our was our discussion. Depends on what you want.

[59:57] Speaker 2: We're using MS Transit like a layer above RabbitMQ.

[1:00:05] Kobbe van Daatselaar: You're Probably thinking about Azure native stuff, right? So Azure Grid and those kind of things. Expensive stuff.

[1:00:12] Speaker 8: We still use Rabbit because we have on- premise, and that's kind of a limitation to modern approach. So.

[1:00:24] Speaker 5: I'm a bit confused here, you know, I'm not like Microsoft guy here but, PHP and Rabbit in the same conversation, in the same sentence. Can you do that?

[1:00:33] Speaker 8: It's uh if you want to do something sending with PHP, you don't have that many choices outside of.

[1:00:40] Speaker 5: So PHP is just like a backend sort of technology, right?

[1:00:45] Speaker 8: Yeah, just to send and to listen to other messages. Listening is a very bad thing with PHP. Sending is easy.

[1:00:56] Speaker 5: I never did that myself.

[1:01:01] Speaker 8: No, We don't have the microservices. PHP, you mean? Yeah. PHP something. For what? No, no. No, I don't know.

[1:01:10] Emilio Oldenziel: Facebook is.

[1:01:14] Kobbe van Daatselaar: 80% of the internet is PHP.

[1:01:15] Speaker 8: Yeah. Internet? WordPress? Laravel? Yeah, yeah.

[1:01:32] Kobbe van Daatselaar: You Mean ASP? ASP, that's the predecessor of. Okay, then I think we're going to wrap it up. Yeah. Thanks a lot for coming.

[1:01:47] Raimond Stokkel: Thank you very much. Yeah, thank you. Really nice. Yeah,

[1:01:52] Speaker 1: Yeah, yeah.

[1:01:58] Kobbe van Daatselaar: I think he found like- minded people. All these specific graphic backend people and architects here, I think he just found some like- minded people. Oh, there he is. That was a lot of information. And the conclusion was mermaid. Mermaid Everything in mermaid.

[1:02:18] Speaker 8: We actually just said mermaid when I came in, and then the rest was fun. Yeah And then you went for a walk.

[1:02:27] Kobbe van Daatselaar: So basically, we just wrapped up. So now, don't know if you have any final thoughts or things that you thought of. Is covered, I guess. Yeah, even Andrew agreed he signed with blood so.

[1:02:46] Speaker 5: In all seriousness about memory, I think we all agree that it's something that is so representable in markdown.
