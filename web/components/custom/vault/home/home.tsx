import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopArtists } from "@/hooks/user/topArtists";
import { TopTracks } from "@/hooks/user/topTracks";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useMinutesListened } from "@/hooks/user/minutes-listened";
import { useListeningPercentile } from "@/hooks/user/listening-percentile";
import { useUndergroundScore } from "@/hooks/user/underground-score";
import CardLoader from "../../CardLoader";
import { SpotifyLink } from "../../SpotifyLink";
import { useUserData } from "@/hooks/user/useUserData";
import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Leaderboard } from "./leaderboard";
import { HyperText } from "@/components/magicui/hyper-text";

export default function Home() {
	const { data: session } = useSession();
	const [timeRange, setTimeRange] = useState("long_term");
	const { topArtists, loading: artistsLoading, error: artistsError } = TopArtists(timeRange, 5);
	const { topTracks, loading: tracksLoading, error: tracksError } = TopTracks(timeRange, 5);
	const { minutesListened, loading: minutesLoading, error: minutesError } = useMinutesListened(10000);
	const { percentileData, error: percentileError } = useListeningPercentile(10000);
	const { undergroundScore, error: undergroundScoreError } = useUndergroundScore();
	const { user } = useUserData(session?.user?.id || "");
	const formattedJoinedAtDate = user?.createdAt
		? new Date(user.createdAt).toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "";

	if (artistsError || tracksError) {
		return (
			<Card className="w-full mx-auto p-6">
				<CardHeader>
					<CardTitle className="text-3xl">Error Loading Vault</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-xl">Unable to retrieve your Spotify data</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full mx-auto shadow-2xl p-6 h-full">
			{artistsLoading || tracksLoading || minutesLoading ? (
				<CardContent className="flex items-center justify-center min-h-[30rem]">
					<CardLoader />
				</CardContent>
			) : (
				<>
					<CardHeader className="flex flex-row-reverse justify-between items-center pb-6">
						<div className="flex flex-col items-center">
							<Avatar className="w-50 h-50">
								<AvatarImage src={session?.user?.image || ""} alt={`${session?.user?.name}'s profile`} className="object-cover" />
								<AvatarFallback className="text-4xl">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
							</Avatar>
							<div className="mt-5">
								<Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
									<SelectTrigger className="cursor-pointer">
										<SelectValue placeholder="Time Range" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem className="cursor-pointer" value="long_term">
											1 Year
										</SelectItem>
										<SelectItem className="cursor-pointer" value="medium_term">
											6 Months
										</SelectItem>
										<SelectItem className="cursor-pointer" value="short_term">
											1 Month
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<CardTitle className="text-4xl mb-4 inline-flex items-center space-x-2">
								<span>Welcome,</span>
								<HyperText>{session?.user?.name || ""}</HyperText>
							</CardTitle>
						</div>
					</CardHeader>

					<CardContent>
						<div className="flex">
							<div className="w-1/2 flex pr-2">
								<div className="w-1/2">
									<div className="mb-4">
										<h3 className="text-xl mb-4">Total Listening (mins)</h3>
										{minutesError ? (
											<p className="text-muted-foreground">Error loading minutes listened</p>
										) : (
											<div className="flex">
												<NumberTicker
													value={minutesListened !== undefined ? Number(minutesListened?.toFixed(2)) : 0}
													decimalPlaces={2}
													className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white"
												/>
											</div>
										)}

										<h3 className="text-xl mt-4 mb-4">Listening Rank</h3>
										{percentileError ? (
											<p className="text-muted-foreground">Error loading listening Percentile</p>
										) : (
											<NumberTicker
												value={percentileData !== undefined ? Number(percentileData?.rank) : 0}
												className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white"
											/>
										)}

										<h3 className="text-xl mt-4 mb-4 flex items-center">
											Underground Score
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<CircleHelp className="ml-1 h-4 w-4" />
													</TooltipTrigger>
													<TooltipContent className="bg-neutral-600 text-white p-2 rounded-xl shadow-md w-60">
														<p className="text-sm">
															Your underground score measures how unique your listening habits are (0-100). A higher score indicates that your music
															taste is more mainstream.
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</h3>
										{undergroundScoreError ? (
											<p className="text-muted-foreground">Error loading Underground Score</p>
										) : (
											<NumberTicker
												value={undergroundScore !== undefined ? Number(undergroundScore?.toPrecision(2)) : 0}
												className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white"
											/>
										)}
										<h3 className="text-xl mt-4">Joined</h3>
										<p className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white">{formattedJoinedAtDate}</p>
									</div>
								</div>

								<div className="w-1/2">
									<h3 className="text-xl mb-4">Leaderboard</h3>
									<Leaderboard className="h-full max-h-[33vh]" />
								</div>
							</div>

							<div className="w-1/2 flex gap-4">
								<div className="w-1/2 pr-2">
									<h3 className="text-xl mb-4">Top Artists</h3>
									<div className="space-y-3">
										{topArtists.map((artist) => (
											<div key={artist.id} className="flex items-center space-x-3">
												<div className="w-16 h-16 relative rounded-lg overflow-hidden shadow-md">
													<SpotifyLink id={artist.id} externalUrl={artist.external_urls.spotify} type="artist">
														<Image
															src={artist.images?.[0]?.url || "/placeholder-artist.png"}
															alt={artist.name}
															layout="fill"
															objectFit="cover"
															className="transition-transform duration-300 hover:scale-110"
														/>
													</SpotifyLink>
												</div>
												<SpotifyLink id={artist.id} externalUrl={artist.external_urls.spotify} type="artist">
													{artist.name}
												</SpotifyLink>
											</div>
										))}
									</div>
								</div>

								<div className="w-1/2 pl-2">
									<h3 className="text-xl mb-4">Top Tracks</h3>
									<div className="space-y-3">
										{topTracks.map((track) => (
											<div key={track.id} className="flex items-center space-x-3">
												<div className="w-16 h-16 flex-shrink-0 relative rounded-lg overflow-hidden shadow-md">
													<SpotifyLink id={track.id} externalUrl={track.external_urls.spotify} type="track">
														<Image
															src={track.album.images?.[0]?.url || "/placeholder-track.png"}
															alt={track.name}
															layout="fill"
															objectFit="cover"
															className="transition-transform duration-300 hover:scale-110"
														/>
													</SpotifyLink>
												</div>
												<SpotifyLink id={track.id} externalUrl={track.external_urls.spotify} type="track">
													{track.name}
												</SpotifyLink>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</>
			)}
		</Card>
	);
}
