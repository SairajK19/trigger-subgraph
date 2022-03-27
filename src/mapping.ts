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
  ClaimedXps,
  Stakes,
  TriggerNfts,
  TriggerPortals,
  Users,
} from "../generated/schema";

export function handleNFTminted(event: NFTminted): void {
  let triggerNfts = TriggerNfts.load(event.transaction.from.toHex());

  if (!triggerNfts) {
    triggerNfts = new TriggerNfts(event.transaction.from.toHex());
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
  let triggerPortal = TriggerPortals.load(event.params.portalId.toHex());

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
  let triggerPortal = TriggerPortals.load(event.params.portalId.toHex());

  if (!triggerPortal) {
    triggerPortal = new TriggerPortals(event.transaction.from.toHex());

    triggerPortal.totalNfts = BigInt.fromI32(0);
    triggerPortal.totalMembers = BigInt.fromI32(0);
    triggerPortal.totalVolume = BigInt.fromI32(0);
  }

  triggerPortal.dbThreadID = event.params.dbThreadID;
  triggerPortal.appId = event.params.appID;
  triggerPortal.createdAt = event.params.createdAt;
  triggerPortal.createBy = event.params.createdBy;
}

export function handlePortalJoined(event: PortalJoined): void {
  let user = Users.load(event.transaction.from.toHex());

  if (!user) {
    user = new Users(event.transaction.from.toHex());
  }

  user.portal = event.params.portalId;
  user.userAddr = event.params.joiner;

  user.save();

  // Increment member count to the portal
  let triggerPortal = TriggerPortals.load(event.params.portalId.toHex());

  if (triggerPortal) {
    triggerPortal.totalMembers = BigInt.fromI32(
      triggerPortal.totalMembers.toI32() + 1
    );

    triggerPortal.save();
  }
}

export function handlePortalXPClaimed(event: PortalXPClaimed): void {
  let claimedXps = ClaimedXps.load(event.transaction.from.toHex());

  if (!claimedXps) {
    claimedXps = new ClaimedXps(event.transaction.from.toHex());
  }

  claimedXps.portalId = event.params.portalId;
  claimedXps.claimer = event.params.claimer;
  claimedXps.amount = event.params.amount;

  claimedXps.save();
}

export function handleStaked(event: Staked): void {
  let stakes = Stakes.load(event.transaction.from.toHex());

  if (!stakes) {
    stakes = new Stakes(event.transaction.from.toHex());
  }

  stakes.portalId = event.params.portalId;
  stakes.amount = event.params.amount;
  stakes.timestamp = event.params.timestamp;
  stakes.staker = event.params.staker;

  stakes.save();
}
