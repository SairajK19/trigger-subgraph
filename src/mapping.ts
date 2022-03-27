import { BigInt } from "@graphprotocol/graph-ts";
import {
  TriggerProtocol,
  NFTminted,
  PortalCreated,
  PortalJoined,
  PortalXPClaimed,
  Staked,
} from "../generated/TriggerProtocol/TriggerProtocol";
import {
  ClaimedXp,
  Stake,
  TriggerNft,
  TriggerPortal,
  User,
} from "../generated/schema";

export function handleNFTminted(event: NFTminted): void {
  let triggerNfts = TriggerNft.load(event.transaction.from.toHex());

  if (!triggerNfts) {
    triggerNfts = new TriggerNft(event.transaction.from.toHex());
  }

  triggerNfts.tokenId = event.params.tokenId;
  triggerNfts.portalId = event.params.portalId;
  triggerNfts.tokenUri = event.params.tokenURI;
  triggerNfts.currentOwner = event.params.currentOwner;
  triggerNfts.previousOwner = event.params.previousOwner;
  triggerNfts.mintedBy = event.params.mintedBy;
  triggerNfts.forSale = event.params.forSale;
  triggerNfts.price = event.params.price;

  triggerNfts.save();

  // Increment NFT count and increase total volume traded inside a portal
  let triggerPortal = TriggerPortal.load(event.params.portalId.toHex());

  if (triggerPortal) {
    triggerPortal.totalNfts = BigInt.fromI32(
      1 + triggerPortal.totalNfts.toI32()
    );

    triggerPortal.totalVolume = BigInt.fromI32(
      event.params.price.toI32() + triggerPortal.totalVolume.toI32()
    );

    triggerPortal.save();
  }
}

export function handlePortalCreated(event: PortalCreated): void {
  let triggerPortal = TriggerPortal.load(event.params.portalId.toHex());

  if (!triggerPortal) {
    triggerPortal = new TriggerPortal(event.params.portalId.toHex());

    triggerPortal.totalNfts = BigInt.fromI32(0);
    triggerPortal.totalMembers = BigInt.fromI32(0);
    triggerPortal.totalVolume = BigInt.fromI32(0);
  }

  triggerPortal.dbThreadID = event.params.dbThreadID;
  triggerPortal.appId = event.params.appID;
  triggerPortal.createdAt = event.params.createdAt;
  triggerPortal.createBy = event.params.createdBy;

  triggerPortal.save()
}

export function handlePortalJoined(event: PortalJoined): void {
  let user = User.load(event.transaction.from.toHex());

  if (!user) {
    user = new User(event.transaction.from.toHex());
  }

  user.portal = event.params.portalId;
  user.userAddr = event.params.joiner;

  user.save();

  // Increment member count to the portal
  let triggerPortal = TriggerPortal.load(event.params.portalId.toHex());

  if (triggerPortal) {
    triggerPortal.totalMembers = BigInt.fromI32(
      triggerPortal.totalMembers.toI32() + 1
    );

    triggerPortal.save();
  }
}

export function handlePortalXPClaimed(event: PortalXPClaimed): void {
  let claimedXp = ClaimedXp.load(event.transaction.from.toHex());

  if (!claimedXp) {
    claimedXp = new ClaimedXp(event.transaction.from.toHex());
  }

  claimedXp.portalId = event.params.portalId;
  claimedXp.claimer = event.params.claimer;
  claimedXp.amount = event.params.amount;

  claimedXp.save();
}

export function handleStaked(event: Staked): void {
  let stake = Stake.load(event.transaction.from.toHex());

  if (!stake) {
    stake = new Stake(event.transaction.from.toHex());
  }

  stake.portalId = event.params.portalId;
  stake.amount = event.params.amount;
  stake.timestamp = event.params.timestamp;
  stake.staker = event.params.staker;

  stake.save();
}
